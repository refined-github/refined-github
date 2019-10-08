import './tags-dropdown.css';
import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import {getRepoURL} from '../libs/utils';
import {octoface} from '../libs/icons';

function init(): false | void {
	if (select.exists('.blankslate')) {
		return false;
	}

	return select('.subnav')!.append(
		<div className="rgh-tags-dropdown float-right d-flex flex-shrink-0 flex-items-center">
			<details className="details-reset details-overlay select-menu branch-select-menu position-relative">
				<summary className="btn select-menu-button css-truncate" data-hotkey="w" title="Find tags" aria-haspopup="menu">
					Select tag&nbsp;
				</summary>
				<details-menu
					className="select-menu-modal position-absolute dropdown-menu-sw"
					src={`/${getRepoURL()}/ref-list/master?source_action=disambiguate&source_controller=files`}
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

// We're reusing the Branch/Tag selector from the repo's Code tab, so we need to update a few things
function onFragmentLoaded(): void {
	// Change the tab to "Tags"
	select('.rgh-tags-dropdown .select-menu-tab:last-child button')!.click();

	// Change links, which point to the content of each tag, to open the tag page instead
	for (const anchorElement of select.all<HTMLAnchorElement>('.rgh-tags-dropdown [href*="/tree/"]')) {
		const pathnameParts = anchorElement.pathname.split('/');
		pathnameParts[3] = 'releases/tag'; // Replace `tree`
		anchorElement.pathname = pathnameParts.join('/');
	}
}

features.add({
	id: __featureName__,
	description: 'Adds a tags dropdown/search on tag/release pages.',
	screenshot: 'https://user-images.githubusercontent.com/22439276/56373231-27ee9980-621e-11e9-9b21-601919d3dddf.png',
	include: [
		features.isReleasesOrTags
	],
	load: features.onAjaxedPages,
	init
});
