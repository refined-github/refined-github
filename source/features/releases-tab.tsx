/*
Access a repository’s releases using the Releases tab or by pressing g r.
https://cloud.githubusercontent.com/assets/170270/13136797/16d3f0ea-d64f-11e5-8a45-d771c903038f.png

The tab isn’t shown if there are no releases.
*/

import {React} from 'dom-chef/react';
import select from 'select-dom';
import features from '../libs/features';
import * as icons from '../libs/icons';
import * as cache from '../libs/cache';
import {getRepoURL} from '../libs/utils';
import {safeElementReady} from '../libs/dom-utils';
import {isRepoRoot, isReleasesOrTags} from '../libs/page-detect';

const repoUrl = getRepoURL();
const repoKey = `releases-count:${repoUrl}`;

// Get as soon as possible, to have it ready before the first paint
const cached = cache.get(repoKey);

function updateReleasesCount() {
	if (isRepoRoot()) {
		const releasesCountEl = select('.numbers-summary a[href$="/releases"] .num');
		const releasesCount = Number(releasesCountEl ? releasesCountEl.textContent.replace(/,/g, '') : 0);
		cache.set(repoKey, releasesCount, 3);
		return releasesCount;
	}

	return cached;
}

async function init() {
	await safeElementReady('.pagehead + *'); // Wait for the tab bar to be loaded
	const count = await updateReleasesCount();
	if (count === 0) {
		return false;
	}

	const releasesTab = (
		<a href={`/${repoUrl}/releases`} class="reponav-item" data-hotkey="g r">
			{icons.tag()}
			<span> Releases </span>
			{count === undefined ? '' : <span class="Counter">{count}</span>}
		</a>
	);
	select('.reponav-dropdown').before(releasesTab);

	if (isReleasesOrTags()) {
		const selected = select('.reponav-item.selected');
		if (selected) {
			selected.classList.remove('js-selected-navigation-item', 'selected');
		}

		releasesTab.classList.add('js-selected-navigation-item', 'selected');
		releasesTab.setAttribute('data-selected-links', 'repo_releases'); // Required for ajaxLoad
	}
}

features.add({
	id: 'releases-tab',
	include: [
		features.isRepo
	],
	load: features.onAjaxedPages,
	shortcuts: {
		'g r': 'Go to Releases'
	},
	init
});
