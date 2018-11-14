/*
Access a repository’s releases using the Releases tab or by pressing g r.
https://cloud.githubusercontent.com/assets/170270/13136797/16d3f0ea-d64f-11e5-8a45-d771c903038f.png

The tab isn’t shown if there are no releases.
*/

import {h} from 'dom-chef';
import select from 'select-dom';
import * as icons from '../libs/icons';
import * as cache from '../libs/cache';
import * as pageDetect from '../libs/page-detect';
import {registerShortcut} from './improve-shortcut-help';

const repoUrl = pageDetect.getRepoURL();
const repoKey = `releases-count:${repoUrl}`;

// Get as soon as possible, to have it ready before the first paint
const cached = cache.get(repoKey);

function updateReleasesCount() {
	if (pageDetect.isRepoRoot()) {
		const releasesCountEl = select('.numbers-summary a[href$="/releases"] .num');
		const releasesCount = Number(releasesCountEl ? releasesCountEl.textContent.replace(/,/g, '') : 0);
		cache.set(repoKey, releasesCount, 3);
		return releasesCount;
	}

	return cached;
}

export default async () => {
	const count = await updateReleasesCount();
	if (count === 0) {
		return;
	}

	const releasesTab = (
		<a href={`/${repoUrl}/releases`} class="reponav-item" data-hotkey="g r">
			{icons.tag()}
			<span> Releases </span>
			{count === undefined ? '' : <span class="Counter">{count}</span>}
		</a>
	);
	select('.reponav-dropdown').before(releasesTab);

	registerShortcut('repos', 'g r', 'Go to Releases');

	if (pageDetect.isReleasesOrTags()) {
		const selected = select('.reponav-item.selected');
		if (selected) {
			selected.classList.remove('js-selected-navigation-item', 'selected');
		}
		releasesTab.classList.add('js-selected-navigation-item', 'selected');
		releasesTab.setAttribute('data-selected-links', 'repo_releases'); // Required for ajaxLoad
	}
};
