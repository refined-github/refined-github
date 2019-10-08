import React from 'dom-chef';
import select from 'select-dom';
import elementReady from 'element-ready';
import cache from 'webext-storage-cache';
import features from '../libs/features';
import * as icons from '../libs/icons';
import {getRepoURL} from '../libs/utils';
import {isRepoRoot, isReleasesOrTags} from '../libs/page-detect';

const repoUrl = getRepoURL();
const repoKey = `releases-count:${repoUrl}`;

let cached: Promise<number | undefined>;

async function updateReleasesCount(): Promise<number | undefined> {
	if (isRepoRoot()) {
		const releasesCountEl = select('.numbers-summary a[href$="/releases"] .num');
		const releasesCount = Number(releasesCountEl ? releasesCountEl.textContent!.replace(/,/g, '') : 0);
		cache.set(repoKey, releasesCount, 3);
		return releasesCount;
	}

	return cached;
}

async function init(): Promise<false | void> {
	await elementReady('.pagehead + *'); // Wait for the tab bar to be loaded
	const count = await updateReleasesCount();
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
		cached = cache.get<number>(repoKey);
	}
});
