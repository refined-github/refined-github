import cache from 'webext-storage-cache';
import {isEnterprise} from 'github-url-detection';
import compareVersions from 'tiny-version-compare';

import {RGHOptions} from '../options-storage';

export type HotfixStorage = Array<[FeatureID, string]>;

export const updateHotfixes = cache.function(async (version: string): Promise<HotfixStorage> => {
	// The explicit endpoint is necessary because it shouldn't change on GHE
	// We can't use `https://raw.githubusercontent.com` because of permission issues https://github.com/refined-github/refined-github/pull/3530#issuecomment-691595925
	const request = await fetch('https://api.github.com/repos/refined-github/refined-github/contents/hotfix.csv?ref=hotfix');
	const {content} = await request.json();

	// Rate-limit check
	if (!content) {
		return [];
	}

	const storage: HotfixStorage = [];
	const lines = atob(content).trim().split('\n');
	for (const line of lines) {
		const [featureID, unaffectedVersion, relatedIssue] = line.split(',');
		if (!unaffectedVersion || compareVersions(unaffectedVersion, version) > 0) {
			storage.push([featureID as FeatureID, relatedIssue]);
		}
	}

	return storage;
}, {
	maxAge: {hours: 6},
	cacheKey: () => 'hotfixes',
});

export const updateStyleHotfixes = cache.function(async (version: string): Promise<string> => {
	// We can't use `https://raw.githubusercontent.com` because of permission issues https://github.com/refined-github/refined-github/pull/3530#issuecomment-691595925
	const request = await fetch(`https://api.github.com/repos/refined-github/refined-github/contents/style/${version}.css?ref=hotfix`);
	const {content} = await request.json();

	if (!content) {
		return '';
	}

	return atob(content).trim();
}, {
	maxAge: {hours: 6},
	cacheKey: () => 'style-hotfixes',
});

export async function getLocalHotfixes(version: string): Promise<HotfixStorage> {
	// To facilitate debugging, ignore hotfixes during development.
	// Change the version in manifest.json to test hotfixes
	if (version === '0.0.0') {
		return [];
	}

	return await cache.get<HotfixStorage>('hotfixes') ?? [];
}

export async function getLocalHotfixesAsOptions(version: string): Promise<Partial<RGHOptions>> {
	const options: Partial<RGHOptions> = {};
	for (const [feature] of await getLocalHotfixes(version)) {
		options[`feature:${feature}`] = false;
	}

	return options;
}

export async function getStyleHotfixes(version: string): Promise<string> {
	if (version === '0.0.0' || isEnterprise()) {
		return '';
	}

	return await cache.get<string>('style-hotfixes') ?? '';
}
