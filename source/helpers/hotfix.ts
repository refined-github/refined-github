import cache from 'webext-storage-cache';
import compareVersions from 'tiny-version-compare';

import {RGHOptions} from '../options-storage';

export const updateHotfixes = cache.function(async (): Promise<string[][]> => {
	// The explicit endpoint is necessary because it shouldn't change on GHE
	const request = await fetch('https://api.github.com/repos/sindresorhus/refined-github/contents/hotfix.csv?ref=hotfix');
	const {content} = await request.json();

	// Rate-limit check
	if (!content) {
		return [];
	}

	return atob(content)
		.trim()
		.split('\n')
		.map(line => line.split(','));
}, {
	maxAge: {hours: 6},
	cacheKey: () => 'hotfixes',
});

export type HotfixStorage = Array<[FeatureID, string, string]>;

export async function getLocalHotfixes(version: string): Promise<HotfixStorage> {
	// To facilitate debugging, ignore hotfixes during development.
	// Change the version in manifest.json to test hotfixes
	if (version === '0.0.0') {
		return [];
	}

	const storage = await cache.get<HotfixStorage>('hotfixes') ?? [];
	return storage.filter(([_, unaffectedVersion]) =>
		!unaffectedVersion || compareVersions(unaffectedVersion, version) > 0,
	);
}

export async function getLocalHotfixesAsOptions(version: string): Promise<Partial<RGHOptions>> {
	const options: Partial<RGHOptions> = {};
	for (const [feature] of await getLocalHotfixes(version)) {
		options[`feature:${feature}`] = false;
	}

	return options;
}
