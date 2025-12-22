import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import delegate, {type DelegateEvent} from 'delegate-it';
import {CachedFunction} from 'webext-storage-cache';

import api from '../github-helpers/api.js';
import features from '../feature-manager.js';
import {buildRepoURL, cacheByRepo} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';
import GetReleases from './releases-dropdown.gql';
import {expectToken} from '../github-helpers/github-token.js';

const getReleases = new CachedFunction('releases', {
	async updater(): Promise<string[]> {
		const {repository} = await api.v4(GetReleases);
		return repository.releases.nodes.map(({tagName}: {tagName: string}) => tagName);
	},
	maxAge: {hours: 1},
	staleWhileRevalidate: {days: 4},
	cacheKey: cacheByRepo,
});

// `datalist` selections don't have an `inputType`
async function selectionHandler(event: DelegateEvent<Event, HTMLInputElement>): Promise<void> {
	const field = event.delegateTarget;
	const selectedTag = field.value;
	const releases = await getReleases.get(); // Expected to be in cache
	if (!('inputType' in event) && releases.includes(selectedTag)) {
		location.href = buildRepoURL('releases/tag', encodeURIComponent(selectedTag));
		field.value = ''; // Can't call `preventDefault`, the `input` event is not cancelable
	}
}

async function addList(searchField: HTMLInputElement): Promise<void> {
	const releases = await getReleases.get();
	if (releases.length === 0) {
		return;
	}

	searchField.setAttribute('list', 'rgh-releases-dropdown');
	searchField.after(
		<datalist id="rgh-releases-dropdown">
			{releases.map(tag => <option value={tag} />)}
		</datalist>,
	);
}

const searchFieldSelector = 'input#release-filter';
async function init(signal: AbortSignal): Promise<void> {
	await expectToken();
	observe(searchFieldSelector, addList, {signal});
	delegate(searchFieldSelector, 'input', selectionHandler, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isReleases,
	],
	init,
});

/*

## Test URLs

https://github.com/refined-github/sandbox/releases

*/
