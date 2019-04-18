/**
To find release notes, release artifacts for any particular tag quickly by selecting the tag from the dropdown.

See it in action at https://github.com/sindresorhus/refined-github/releases
*/
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

	return select('.subnav')!.append(
		<div className="rgh-tags-dropdown float-right d-flex flex-shrink-0 flex-items-center mb-3">
			<details className="details-reset details-overlay select-menu branch-select-menu position-relative">
				<summary className="btn select-menu-button css-truncate" data-hotkey="w" title="Find tags" aria-haspopup="menu">
					Select tag&nbsp;
				</summary>
				<details-menu
					className="select-menu-modal position-absolute dropdown-menu-sw"
					src={`/${ownerName}/${repoName}/ref-list/master?source_action=disambiguate&source_controller=files`}
					preload
					role="menu"
					style={{zIndex: 99}}
				>
					<include-fragment className="select-menu-loading-overlay anim-pulse" onLoad={onFragmentLoaded}>
						{octoface()}
					</include-fragment>
				</details-menu>
			</details>
		</div>
	);
}

// We’re reusing the Branch/Tag selector from the repo’s Code tab, so we need to update a few things
function onFragmentLoaded() {
	// Change the tab to Tags
	select('.rgh-tags-dropdown .select-menu-tab:last-child button')!.click();

	// Change links (which point to the content of each tag) to open the tag page instead
	for (const anchorElement of select.all<HTMLAnchorElement>('.rgh-tags-dropdown [href*="/tree/"]')) {
		const splitPathName = anchorElement.pathname.split('/');
		splitPathName[3] = 'releases/tag'; // Replace "tree"
		anchorElement.pathname = splitPathName.join('/');
	}
}

features.add({
	id: 'tags-dropdown',
	include: [
		features.isReleasesOrTags
	],
	load: features.onAjaxedPages,
	init
});
