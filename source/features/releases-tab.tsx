import * as pageDetect from 'github-url-detection';
import TagIcon from 'octicons-plain-react/Tag';
import {writable} from 'svelte/store';
import {CachedFunction} from 'webext-storage-cache';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {registerHotkey} from '../github-helpers/hotkey.js';
import {buildRepoUrl, cacheByRepo, getRepo} from '../github-helpers/index.js';
import {addTab} from '../helpers/extensible-nav-store.js';
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

export async function getReleasesCount(): Promise<[0] | [number, 'Tags' | 'Releases']> {
	const repo = getRepo()!.nameWithOwner;
	return releasesCount.get(repo);
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
