import select from 'select-dom';
import {h} from 'dom-chef';
import * as icons from '../libs/icons';
import * as pageDetect from '../libs/page-detect';
import {registerShortcut} from './improve-shortcut-help';

const repoUrl = pageDetect.getRepoURL();
const repoKey = `${repoUrl}-releases-count`;

// Get as soon as possible, to have it ready before the first paint
let localCache = browser.storage.local.get(repoKey);

function appendReleasesCount(count) {
	if (count) {
		select('.reponav-releases').append(
			<span class="Counter">{count}</span>
		);
	}
}

function updateReleasesCount() {
	if (pageDetect.isRepoRoot()) {
		const releasesCount = select('.numbers-summary a[href$="/releases"] .num').textContent.trim();
		localCache = {[repoKey]: releasesCount};
		browser.storage.local.set(localCache);
	}
}

export default async () => {
	const releasesTab = (
		<a href={`/${repoUrl}/releases`} class="reponav-item reponav-releases" data-hotkey="g r">
			{icons.tag()}
			<span> Releases </span>
		</a>
	);
	registerShortcut('repos', 'g r', 'Go to Releases');

	select('.reponav-dropdown').before(releasesTab);

	updateReleasesCount();
	appendReleasesCount((await localCache)[repoKey]);

	if (pageDetect.isReleasesOrTags()) {
		const selected = select('.reponav-item.selected');
		if (selected) {
			selected.classList.remove('js-selected-navigation-item', 'selected');
		}
		releasesTab.classList.add('js-selected-navigation-item', 'selected');
		releasesTab.setAttribute('data-selected-links', 'repo_releases'); // Required for ajaxLoad
	}
};
