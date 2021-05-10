import cache from 'webext-storage-cache';
import compareVersions from 'tiny-version-compare';

import {RGHOptions} from '../options-storage';

export const updateHotfixes = cache.function(async (): Promise<string[][]> => {
	// The explicit endpoint is necessary because it shouldn't change on GHE
	const request = await fetch('https://api.github.com/repos/sindresorhus/refined-github/contents/hotfix.csv?ref=hotfix');
	const {content} = await request.json();

	// Rate-limit check
	if (!content) {
		return {};
	}

	return atob(content)
		.trim()
		.split('\n')
		.map(line => line.split(','));
}, {
	maxAge: {hours: 6},
	cacheKey: () => 'hotfixes'
});

export async function getLocalHotfixes(version: string): Promise<Partial<RGHOptions>> {
	// To facilitate debugging, ignore hotfixes during development
	if (version === '0.0.0') {
		return {};
	}

	const hotfixes = await cache.get<string[][]>('hotfixes');
	if (!hotfixes) {
		return {};
	}

	const options: Partial<RGHOptions> = {};

	for (const [feature, unaffectedVersion] of hotfixes) {
		if (!unaffectedVersion || compareVersions(unaffectedVersion, version) > 0) {
			options[`feature:${feature}`] = false;
		}
	}

	return options;
}
