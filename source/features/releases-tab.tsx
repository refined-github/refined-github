import React from 'dom-chef';
import select from 'select-dom';
import elementReady from 'element-ready';
import cache from 'webext-storage-cache';
import features from '../libs/features';
import * as api from '../libs/api';
import * as icons from '../libs/icons';
import {getRepoURL, getRepoGQL} from '../libs/utils';
import {isRepoRoot, isReleasesOrTags} from '../libs/page-detect';

const repoUrl = getRepoURL();
const repoKey = `releases-count:${repoUrl}`;

let cached: Promise<number | undefined>;

async function updateReleasesCount(): Promise<number | undefined> {
	// If it’s available on the current page, always serve it fresh rather than from cache
	if (isRepoRoot()) {
		const releasesCountElement = await elementReady('.numbers-summary a[href$="/releases"] .num');
		const releasesCount = Number(releasesCountElement ? releasesCountElement.textContent!.replace(/,/g, '') : 0);
		cache.set(repoKey, releasesCount, 3);
		return releasesCount;
	}

	// Check the cache
	const cachedValue = await cache.get<number>(repoKey);
	if (typeof cachedValue !== 'undefined') {
		return cachedValue;
	}

	// As a last resort, query the API
	const {repository} = await api.v4(`
		repository(${getRepoGQL()}) {
			refs(refPrefix: "refs/tags/") {
				totalCount
			}
		}
	`);

	cache.set(repoKey, repository.refs.totalCount, 3);

	return repository.refs.totalCount;
}

async function init(): Promise<false | void> {
	await elementReady('.pagehead + *'); // Wait for the tab bar to be loaded
	const count = await cached;
	if (count === 0) {
		return false;
	}

	const releasesTab = (
		<a href={`/${repoUrl}/releases`} className="reponav-item" data-hotkey="g r">
			{icons.tag()}
			<span> Releases </span>
			{count === undefined ? '' : <span className="Counter">{count}</span>}
		</a>
	);
	select('.reponav-dropdown')!.before(releasesTab);

	if (isReleasesOrTags()) {
		const selected = select('.reponav-item.selected');
		if (selected) {
			selected.classList.remove('js-selected-navigation-item', 'selected');
		}

		releasesTab.classList.add('js-selected-navigation-item', 'selected');
		releasesTab.dataset.selectedLinks = 'repo_releases'; // Required for ajaxLoad
	}
}

features.add({
	id: __featureName__,
	description: 'Adds a `Releases` tab and a keyboard shortcut: `g` `r`.',
	screenshot: 'https://cloud.githubusercontent.com/assets/170270/13136797/16d3f0ea-d64f-11e5-8a45-d771c903038f.png',
	include: [
		features.isRepo
	],
	load: features.onAjaxedPages,
	shortcuts: {
		'g r': 'Go to Releases'
	},
	init
});

features.add({
	id: __featureName__,
	description: false,
	screenshot: false,
	include: [
		features.isRepo
	],
	init() {
		// Get as soon as possible, to have it ready before the first paint
		cached = updateReleasesCount();
	}
});
