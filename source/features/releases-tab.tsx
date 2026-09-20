/**
@description Adds a <code>Releases</code> tab and a keyboard shortcut: <kbd>g</kbd> <kbd>r</kbd> (depends on <code>extensible-nav</code> feature).
@screenshot https://cloud.githubusercontent.com/assets/170270/13136797/16d3f0ea-d64f-11e5-8a45-d771c903038f.png
*/

import * as pageDetect from 'github-url-detection';
import TagIcon from 'octicons-plain-react/Tag';
import {writable} from 'svelte/store';
import {CachedFunction} from 'webext-storage-cache';

import {addTab} from '../components/extensible-nav-store.js';
import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {registerHotkey} from '../github-helpers/hotkey.js';
import {buildRepoUrl, cacheByRepo, getRepo} from '../github-helpers/index.js';
import onetime from '../helpers/onetime.js';
import GetReleasesCount from './releases-tab.gql';

async function fetchCounts(nameWithOwner: string): Promise<[0] | [number, 'Tags' | 'Releases']> {
	const [owner, name] = nameWithOwner.split('/', 2);
	const {repository: {releases, tags}} = await api.v4(GetReleasesCount, {
		variables: {name, owner},
	});

	if (releases.totalCount) {
		return [releases.totalCount, 'Releases'];
	}

	if (tags.totalCount) {
		return [tags.totalCount, 'Tags'];
	}

	return [0];
}

const releasesCount = new CachedFunction('releases-count', {
	updater: fetchCounts,
	shouldRevalidate: cachedValue => typeof cachedValue === 'number',
	maxAge: {hours: 1},
	staleWhileRevalidate: {days: 3},
	cacheKey: cacheByRepo,
});

async function getReleasesCount(): Promise<[0] | [number, 'Tags' | 'Releases']> {
	const repo = getRepo()!.nameWithOwner;
	return releasesCount.get(repo);
}

export async function doesRepoHaveAnyTags(): Promise<boolean> {
	const [count] = await getReleasesCount();
	return count > 0;
}

async function addReleasesTabOnce(): Promise<false | void> {
	const [count, type] = await getReleasesCount();
	if (!type) {
		return false;
	}

	const href = buildRepoUrl(type.toLowerCase());
	const {pathname} = new URL(href);

	addTab({
		id: 'rgh-releases',
		href,
		label: type,
		icon: TagIcon,
		counter: writable(count),
		selected: () => location.pathname === pathname,
	});
}

function init(signal: AbortSignal): void {
	registerHotkey('g r', buildRepoUrl('releases'), {signal});
}

void features.add(import.meta.url, {
	shortcuts: {
		'g r': 'Go to Releases',
	},
	include: [
		pageDetect.hasRepoHeader,
	],
	requiresToken: true,
	init: onetime(addReleasesTabOnce),
}, {
	include: [
		pageDetect.hasRepoHeader,
	],
	init,
});

/*

Test URLs:

Releases: https://github.com/refined-github/refined-github
Tags: https://github.com/python/cpython

*/
