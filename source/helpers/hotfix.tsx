import React from 'dom-chef';
import {CachedFunction} from 'webext-storage-cache';
import {isEnterprise} from 'github-url-detection';
import compareVersions from 'tiny-version-compare';
import {any as concatenateTemplateLiteralTag} from 'code-tag';

import {RGHOptions} from '../options-storage.js';
import isDevelopmentVersion from './is-development-version.js';

const {version: currentVersion} = browser.runtime.getManifest();

function parseCsv(content: string): string[][] {
	const lines = [];
	const [_header, ...rawLines] = content.trim().split('\n');
	for (const line of rawLines) {
		if (line.trim()) {
			lines.push(line.split(',').map(cell => cell.trim()));
		}
	}

	return lines;
}

async function fetchHotfix(path: string): Promise<string> {
	// The explicit endpoint is necessary because it shouldn't change on GHE
	// We can't use `https://raw.githubusercontent.com` because of permission issues https://github.com/refined-github/refined-github/pull/3530#issuecomment-691595925
	const request = await fetch(`https://api.github.com/repos/refined-github/yolo/contents/${path}`);
	const {content} = await request.json();

	// Rate-limit check
	if (content) {
		return atob(content).trim();
	}

	return '';
}

type HotfixStorage = Array<[FeatureID, string, string]>;

export const brokenFeatures = new CachedFunction('broken-features', {
	async updater(): Promise<HotfixStorage> {
		const content = await fetchHotfix('broken-features.csv');
		if (!content) {
			return [];
		}

		const storage: HotfixStorage = [];
		for (const [featureID, relatedIssue, unaffectedVersion] of parseCsv(content)) {
			if (featureID && relatedIssue && (!unaffectedVersion || compareVersions(unaffectedVersion, currentVersion) > 0)) {
				storage.push([featureID as FeatureID, relatedIssue, unaffectedVersion]);
			}
		}

		return storage;
	},
	maxAge: {hours: 6},
	staleWhileRevalidate: {days: 30},
});

export const styleHotfixes = new CachedFunction('style-hotfixes', {
	updater: async (version: string): Promise<string> => fetchHotfix(`style/${version}.css`),

	maxAge: {hours: 6},
	staleWhileRevalidate: {days: 300},
	cacheKey: () => '',
},
);

export async function getLocalHotfixes(): Promise<HotfixStorage> {
	// To facilitate debugging, ignore hotfixes during development.
	// Change the version in manifest.json to test hotfixes
	if (isDevelopmentVersion()) {
		return [];
	}

	return await brokenFeatures.get() ?? [];
}

export async function getLocalHotfixesAsOptions(): Promise<Partial<RGHOptions>> {
	const options: Partial<RGHOptions> = {};
	for (const [feature] of await getLocalHotfixes()) {
		options[`feature:${feature}`] = false;
	}

	return options;
}

export async function applyStyleHotfixes(style: string): Promise<void> {
	if (isDevelopmentVersion() || isEnterprise() || !style) {
		return;
	}

	// Prepend to body because that's the only way to guarantee they come after the static file
	document.body.prepend(<style>{style}</style>);
}

let localStrings: Record<string, string> = {};
export function _(...arguments_: Parameters<typeof concatenateTemplateLiteralTag>): string {
	const original = concatenateTemplateLiteralTag(...arguments_);
	return localStrings[original] ?? original;
}

// Updates the local object from the storage to enable synchronous access
export async function preloadSyncLocalStrings(): Promise<void> {
	if (isDevelopmentVersion() || isEnterprise()) {
		return;
	}

	localStrings = await localStringsHotfix.get() ?? {};
}

export const localStringsHotfix = new CachedFunction('strings-hotfixes', {
	async updater(): Promise<Record<string, string>> {
		const json = await fetchHotfix('strings.json');
		return json ? JSON.parse(json) : {};
	},
	maxAge: {hours: 6},
	staleWhileRevalidate: {days: 30},
});
