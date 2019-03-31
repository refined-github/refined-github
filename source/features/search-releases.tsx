import React from 'dom-chef';
import select from 'select-dom';

import features from '../libs/features';
import {isReleasesOrTags} from '../libs/page-detect';
import {getOwnerAndRepo} from '../libs/utils';
import {octoface} from '../libs/icons';

async function init() {
	if (!isReleasesOrTags()) {
		return false;
	}

	if (!isOnReleasePage()) {
		return false;
	}

	addSelectMenu();
	registerEventListener();
}

const isOnReleasePage = () => select.exists('.release-entry') || select.exists('.release');

const getSelectedTagFromUrl = () => {
	const result = location.href.match(/releases\/tag\/([^>/]*)/) || [];

	return (result && result.length > 0) ? result[1] : null;
};

const addSelectMenu = () => {
	const container = select('.subnav');
	const {ownerName, repoName} = getOwnerAndRepo();
	const selectedTag = getSelectedTagFromUrl();

	container.append((
		<div class="refined-github-search-releases float-right d-flex flex-shrink-0 flex-items-center mb-3">
			<details class="details-reset details-overlay select-menu branch-select-menu">
				<summary class="btn btn-sm select-menu-button css-truncate" data-hotkey="w" title="Filter releases" aria-haspopup="menu">
					<i>Filter:</i>&nbsp;
					<span class="css-truncate-target">{selectedTag || 'Releases'}</span>&nbsp;
				</summary>
				<details-menu
					class="js-release-details select-menu-modal position-absolute"
					src={`/${ownerName}/${repoName}/ref-list/master?source_action=disambiguate&source_controller=files`}
					preload
					role="menu"
					style="z-index: 99;"
				>
					<include-fragment class="select-menu-loading-overlay anim-pulse">
						{octoface()}
					</include-fragment>
				</details-menu>
			</details>
		</div>
	));
};

const registerEventListener = () => {
	const includeFragment = select('.js-release-details > include-fragment');

	return includeFragment ? includeFragment.addEventListener('loadend', onFragmentLoaded) : null;
};

const onFragmentLoaded = () => {
	adjustMenuStyles();
	adjustTextInputStyles();
	removeBranches();
	adjustListStyles();
	removeHeader();
	removeTabs();
	updateLinks();
};

// Needed because somehow style given at Line no 65 is getting removed.
const adjustMenuStyles = () => {
	const detailsMenu = select('.js-release-details');

	if (!detailsMenu) {
		return false;
	}

	detailsMenu.style.zIndex = '99';
};

const adjustTextInputStyles = () => {
	const textInput = select('.js-release-details > tab-container > .select-menu-filters > .select-menu-text-filter > input');

	if (!textInput) {
		return false;
	}

	textInput.setAttribute('aria-label', 'Type to filter releases');
	textInput.setAttribute('placeholder', 'Type to filter releases...');
};

const removeBranches = () => {
	const branchList = select('.js-release-details > tab-container > .select-menu-list');

	return branchList ? branchList.remove() : false;
};

const adjustListStyles = () => {
	const tagList = select('.js-release-details > tab-container > .select-menu-list');

	if (!tagList) {
		return false;
	}

	tagList.removeAttribute('hidden');
};

const removeHeader = () => {
	const header = select('.js-release-details > .select-menu-header');

	return header ? header.remove() : false;
};

const removeTabs = () => {
	const tabs = select('.js-release-details > tab-container > .select-menu-filters > .select-menu-tabs');

	return tabs ? tabs.remove() : false;
};

const updateLinks = () => {
	const links = select.all('.js-release-details > tab-container > .select-menu-list > div .select-menu-item');
	const selectedTag = getSelectedTagFromUrl();

	links.forEach(item => {
		const link = item.getAttribute('href');

		item.setAttribute('href', link.replace('/tree/', '/releases/tag/'));

		if (item.innerText.trim() === selectedTag) {
			item.classList.add('selected');
		}
	});
};

const deregisterEventListener = () => {
	const includeFragment = select('.js-release-details > include-fragment');

	return includeFragment ? includeFragment.removeEventListener('loadend', onFragmentLoaded) : null;
};

function deinit() {
	deregisterEventListener();
}

features.add({
	id: 'search-releases',
	include: [features.isReleasesOrTags],
	load: features.onAjaxedPages,
	init,
	deinit
});
