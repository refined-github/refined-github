import React from 'dom-chef';
import select from 'select-dom';

import features from '../libs/features';
import {getOwnerAndRepo} from '../libs/utils';
import {octoface} from '../libs/icons';

async function init() {
	if (!hasAnyReleases()) {
		return false;
	}

	addSelectMenu();
	registerEventListener();
}

const hasAnyReleases = () => select.exists('.release-entry') || select.exists('.release');

const addSelectMenu = () => {
	const container = select('.subnav');
	const {ownerName, repoName} = getOwnerAndRepo();
	const selectedTag = getSelectedTagFromUrl();

	container.append(
		<div class="float-right d-flex flex-shrink-0 flex-items-center mb-3">
			<details class="details-reset details-overlay select-menu branch-select-menu">
				<summary class="btn btn-sm select-menu-button css-truncate" data-hotkey="w" title="Filter releases" aria-haspopup="menu">
					<i>Filter:</i>&nbsp;
					<span class="css-truncate-target">{selectedTag || 'Releases'}</span>&nbsp;
				</summary>
				<details-menu
					class="rgh-release-details select-menu-modal position-absolute"
					src={`/${ownerName}/${repoName}/ref-list/master?source_action=disambiguate&source_controller=files`}
					preload
					role="menu"
					style={{zIndex: 99}}
				>
					<include-fragment class="select-menu-loading-overlay anim-pulse">
						{octoface()}
					</include-fragment>
				</details-menu>
			</details>
		</div>
	);
};

const getSelectedTagFromUrl = () => {
	const [tag = null] = location.href.match(/(?<=\/releases\/tag\/)([^/]+)/) || [];

	return tag;
};

const registerEventListener = () => {
	const includeFragment = select('.rgh-release-details > include-fragment');

	return includeFragment ? includeFragment.addEventListener('loadend', onFragmentLoaded) : null;
};

const onFragmentLoaded = () => {
	const textInput = select('.rgh-release-details > tab-container > .select-menu-filters > .select-menu-text-filter > input');

	textInput.setAttribute('aria-label', 'Type to filter releases');
	textInput.setAttribute('placeholder', 'Type to filter releases...');

	select('.rgh-release-details > tab-container > .select-menu-list').remove();

	select('.rgh-release-details > tab-container > .select-menu-list').removeAttribute('hidden');

	select('.rgh-release-details > .select-menu-header').remove();

	select('.rgh-release-details > tab-container > .select-menu-filters > .select-menu-tabs').remove();

	const links = select.all<HTMLAnchorElement>('.rgh-release-details > tab-container > .select-menu-list > div .select-menu-item');
	const selectedTag = getSelectedTagFromUrl();

	for (const item of links) {
		const arr = item.pathname.split('/');

		arr[3] = 'releases/tag'; // Replace "tree"

		item.pathname = arr.join('/');

		if (item.textContent.trim() === selectedTag) {
			item.classList.add('selected');
		}
	}
};

features.add({
	id: 'search-releases',
	include: [features.isReleasesOrTags],
	load: features.onAjaxedPages,
	init
});
