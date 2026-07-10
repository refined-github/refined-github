import {any as concatenateTemplateLiteralTag} from 'code-tag';
import React from 'dom-chef';
import {isEnterprise} from 'github-url-detection';
import {CachedFunction} from 'webext-storage-cache';

import type {RghOptions} from '../options-storage.js';
import {getNewFeatureName} from '../feature-data.js';
import isDevelopmentVersion from './is-development-version.js';
import {isomorphicFetchText} from './isomorphic-fetch.js';
import {type BrokenFeatureEntry, parseBrokenFeaturesCsv} from './hotfix-parse.js';

const {version: currentVersion} = chrome.runtime.getManifest();

async function fetchHotfix(path: string): Promise<string> {
	// Use GitHub Pages host because the API is rate-limited
	return isomorphicFetchText(`https://refined-github.github.io/yolo/${path}`, {
		cache: 'no-store', // Disable caching altogether
	});
}

type HotfixStorage = BrokenFeatureEntry[];

export const brokenFeatures = new CachedFunction('broken-features', {
	async updater(): Promise<HotfixStorage> {
		const content = await fetchHotfix('broken-features.csv');
		return parseBrokenFeaturesCsv(content, currentVersion);
	},
	maxAge: {hours: 6},
	staleWhileRevalidate: {days: 30},
});

export const styleHotfixes = new CachedFunction('style-hotfixes', {
	updater: async (version: string): Promise<string> => fetchHotfix(`style/${version}.css`),

	maxAge: {hours: 6},
	staleWhileRevalidate: {days: 300},
	cacheKey: () => '',
});

export async function getLocalHotfixes(): Promise<HotfixStorage> {
	// To facilitate debugging, ignore hotfixes during development.
	// Change the version in manifest.json to test hotfixes
	if (isDevelopmentVersion()) {
		return [];
	}

	return await brokenFeatures.get() ?? [];
}

export async function getLocalHotfixesAsOptions(): Promise<Partial<RghOptions>> {
	const options: Partial<RghOptions> = {};
	for (const [feature] of await getLocalHotfixes()) {
		const currentFeature = getNewFeatureName(feature);
		if (currentFeature) {
			options[`feature:${currentFeature}`] = false;
		}
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

const localStringsHotfix = new CachedFunction('strings-hotfixes', {
	async updater(): Promise<Record<string, string>> {
		const json = await fetchHotfix('strings.json');
		return json ? JSON.parse(json) : {};
	},
	maxAge: {hours: 6},
	staleWhileRevalidate: {days: 30},
});

// Updates the local object from the storage to enable synchronous access
export async function preloadSyncLocalStrings(): Promise<void> {
	if (isDevelopmentVersion() || isEnterprise()) {
		return;
	}

	localStrings = await localStringsHotfix.get() ?? {};
}
