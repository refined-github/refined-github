import React from 'dom-chef';
import select from 'select-dom';

import features from '../libs/features';
import {getOwnerAndRepo} from '../libs/utils';
import {octoface} from '../libs/icons';

async function init() {
	if (select.exists('.blankslate')) {
		return false;
	}

	const {ownerName, repoName} = getOwnerAndRepo();

	select('.subnav').append(
		<div class="rgh-search-tags float-right d-flex flex-shrink-0 flex-items-center mb-3">
			<details class="details-reset details-overlay select-menu branch-select-menu">
				<summary class="btn btn-sm select-menu-button css-truncate" data-hotkey="w" title="Filter releases" aria-haspopup="menu">
					<i>Filter:</i>&nbsp;
					<span class="css-truncate-target">{getCurrentTag() || 'Releases'}</span>&nbsp;
				</summary>
				<details-menu
					class="rgh-release-details select-menu-modal position-absolute"
					src={`/${ownerName}/${repoName}/ref-list/${getCurrentTag() || 'master'}?source_action=disambiguate&source_controller=files`}
					preload
					role="menu"
					style={{zIndex: 99}}
				>
					<include-fragment class="select-menu-loading-overlay anim-pulse" onload={onFragmentLoaded}>
						{octoface()}
					</include-fragment>
				</details-menu>
			</details>
		</div>
	);
}

const getCurrentTag = () => {
	const [tag] = location.href.match(/(?<=\/releases\/tag\/)([^/]+)/) || [undefined];

	return tag;
};

const onFragmentLoaded = () => {
	const textInput = select('.rgh-release-details .select-menu-text-filter input');

	textInput.setAttribute('aria-label', 'Type to filter releases');
	textInput.setAttribute('placeholder', 'Type to filter releases...');
	// Changes tab to Tags
	select('.rgh-search-tags .select-menu-tab:last-child button').click();

	const links = select.all<HTMLAnchorElement>('.rgh-release-details .select-menu-item');
	for (const item of links) {
		const arr = item.pathname.split('/');

		arr[3] = 'releases/tag'; // Replace "tree"

		item.pathname = arr.join('/');
	}
};

features.add({
	id: 'search-releases',
	include: [
		features.isReleasesOrTags
	],
	load: features.onAjaxedPages,
	init
});
