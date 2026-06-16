import delegate, {type DelegateEvent} from 'delegate-it';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {CachedFunction} from 'webext-storage-cache';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {buildRepoUrl, cacheByRepo} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';
import GetReleases from './releases-dropdown.gql';

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
	if (selectedTag === 'prerelease:false') {
		location.assign('?q=prerelease%3Afalse');
		return;
	}

	const releases = await getReleases.get(); // Expected to be in cache
	if (!('inputType' in event) && releases.includes(selectedTag)) {
		location.assign(buildRepoUrl('releases/tag', encodeURIComponent(selectedTag)));
		field.value = ''; // Can't call `preventDefault`, the `input` event is not cancelable
	}
}

async function addList(searchField: HTMLInputElement): Promise<void> {
	const releases = await getReleases.get();
	if (releases.length === 0) {
		return;
	}

	// `q` is only present in searches
	const hidePreReleases = new URLSearchParams(location.search).get('q')?.includes('prerelease:false');

	searchField.setAttribute('list', 'rgh-releases-dropdown');
	searchField.after(
		<datalist id="rgh-releases-dropdown">
			<option
				value="prerelease:false"
				selected={hidePreReleases}
			/>
			{releases.map(tag => <option value={tag} />)}
		</datalist>,
	);
}

const searchFieldSelector = 'input#release-filter';
async function init(signal: AbortSignal): Promise<void> {
	observe(searchFieldSelector, addList, {signal});
	delegate(searchFieldSelector, 'input', selectionHandler, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isReleases,
	],
	requiresToken: true,
	init,
});

/*

## Test URLs

https://github.com/refined-github/sandbox/releases

*/
