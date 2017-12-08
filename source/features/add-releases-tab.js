import select from 'select-dom';
import {h} from 'dom-chef';
import * as icons from '../libs/icons';
import * as pageDetect from '../libs/page-detect';

const repoUrl = pageDetect.getRepoURL();
const repoKey = `${repoUrl}-releases-count`;

// Get as soon as possible, to have it ready before the first paint
let localCache = browser.storage.local.get(repoKey);

function appendReleasesCount(count) {
	if (!count) {
		return;
	}

	select('.reponav-releases').append(<span class="Counter">{count}</span>);
}

function updateReleasesCount() {
	if (pageDetect.isRepoRoot()) {
		const releasesCount = select('.numbers-summary a[href$="/releases"] .num').textContent.trim();
		localCache = {[repoKey]: releasesCount};
		browser.storage.local.set(localCache);
	}
}

export default async () => {
	if (select.exists('.reponav-releases')) {
		return;
	}

	const releasesTab = (
		<a href={`/${repoUrl}/releases`} class="reponav-item reponav-releases" data-hotkey="g r">
			{icons.tag()}
			<span> Releases </span>
		</a>
	);

	select('.reponav-dropdown').before(releasesTab);

	updateReleasesCount();
	appendReleasesCount((await localCache)[repoKey]);

	if (pageDetect.isReleases()) {
		releasesTab.classList.add('js-selected-navigation-item', 'selected');
		select('.reponav-item.selected')
			.classList.remove('js-selected-navigation-item', 'selected');
	}
};
