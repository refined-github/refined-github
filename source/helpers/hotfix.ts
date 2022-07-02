import cache from 'webext-storage-cache';
import {isEnterprise} from 'github-url-detection';
import compareVersions from 'tiny-version-compare';

import {RGHOptions} from '../options-storage';
import isDevelopmentVersion from './is-development-version';

function parseCsv(content: string): string[][] {
	const lines = [];
	for (const line of content.split('\n')) {
		if (line.trim()) {
			lines.push(line.split(',').map(cell => cell.trim()));
		}
	}

	return lines;
}

export type HotfixStorage = Array<[FeatureID, string]>;

export const updateHotfixes = cache.function(async (version: string): Promise<HotfixStorage> => {
	// The explicit endpoint is necessary because it shouldn't change on GHE
	// We can't use `https://raw.githubusercontent.com` because of permission issues https://github.com/refined-github/refined-github/pull/3530#issuecomment-691595925
	const request = await fetch('https://api.github.com/repos/refined-github/yolo/contents/broken-features.csv');
	const {content} = await request.json();

	// Rate-limit check
	if (!content) {
		return [];
	}

	const storage: HotfixStorage = [];
	for (const [featureID, unaffectedVersion, relatedIssue] of parseCsv(atob(content))) {
		if (featureID && relatedIssue && (!unaffectedVersion || compareVersions(unaffectedVersion, version) > 0)) {
			storage.push([featureID as FeatureID, relatedIssue]);
		}
	}

	return storage;
}, {
	maxAge: {hours: 6},
	staleWhileRevalidate: {days: 3},
	cacheKey: () => 'hotfixes',
});

export const updateStyleHotfixes = cache.function(async (version: string): Promise<string> => {
	// See comments for `updateHotfixes`
	const request = await fetch(`https://api.github.com/repos/refined-github/yolo/contents/style/${version}.css`);
	const {content} = await request.json();

	if (!content) {
		return '';
	}

	return atob(content).trim();
}, {
	maxAge: {hours: 6},
	staleWhileRevalidate: {days: 30},
	cacheKey: () => 'style-hotfixes',
});

export async function getLocalHotfixes(): Promise<HotfixStorage> {
	// To facilitate debugging, ignore hotfixes during development.
	// Change the version in manifest.json to test hotfixes
	if (isDevelopmentVersion()) {
		return [];
	}

	return await cache.get<HotfixStorage>('hotfixes') ?? [];
}

export async function getLocalHotfixesAsOptions(): Promise<Partial<RGHOptions>> {
	const options: Partial<RGHOptions> = {};
	for (const [feature] of await getLocalHotfixes()) {
		options[`feature:${feature}`] = false;
	}

	return options;
}

export async function getStyleHotfixes(): Promise<string> {
	if (isDevelopmentVersion() || isEnterprise()) {
		return '';
	}

	return await cache.get<string>('style-hotfixes') ?? '';
}
