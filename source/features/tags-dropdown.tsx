import './tags-dropdown.css';
import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import {buildRepoURL} from '../github-helpers';
import {ToastSpinner} from '../github-helpers/toast';

// We're reusing the Branch/Tag selector from the repo's Code tab, so we need to update a few things
function changeTabToTags(): void {
	// Select "Tags" tab
	select('.rgh-tags-dropdown button.SelectMenu-tab:last-child')!.click();
}

function updateLinksToTag(): void {
	// Change links, which point to the content of each tag, to open the tag page instead
	for (const anchorElement of select.all('.rgh-tags-dropdown #tags-menu a.SelectMenu-item[href*="/tree/"]')) {
		const pathnameParts = anchorElement.pathname.split('/');
		pathnameParts[3] = 'releases/tag'; // Replace `tree`
		anchorElement.pathname = pathnameParts.join('/');
	}
}

function init(): void {
	const tagsDropdown = (
		<div className="rgh-tags-dropdown float-right d-flex flex-shrink-0 flex-items-center">
			<details className="details-reset details-overlay select-menu branch-select-menu position-relative">
				<summary className="btn select-menu-button css-truncate" data-hotkey="w" title="Find tags" aria-haspopup="menu">
					Select tag&nbsp;
				</summary>
				<details-menu
					preload
					className="select-menu-modal position-absolute dropdown-menu-sw"
					src={buildRepoURL('ref-list/master?source_action=disambiguate&source_controller=files')}
					role="menu"
					style={{zIndex: 99}}
				>
					<include-fragment className="select-menu-loading-overlay anim-pulse" onLoad={changeTabToTags}>
						<ToastSpinner/>
					</include-fragment>
				</details-menu>
			</details>
		</div>
	);

	if (pageDetect.isEnterprise() || pageDetect.isTags()) {
		select('.subnav')!.append(tagsDropdown);
	} else {
		const searchBarWrapper = select('input[aria-label="Find a release"]')!.closest('div')!;
		searchBarWrapper.prepend(
			<div className="mr-2 mr-md-0 ml-md-2">
				{tagsDropdown}
			</div>,
		);
		searchBarWrapper.classList.add('d-flex');
	}

	// https://github.com/github/remote-input-element#events
	// Wait until the network request is finished and HTML body is updated
	// "remote-input-success" event bubbles
	select('.rgh-tags-dropdown')!.addEventListener('remote-input-success', updateLinksToTag);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isReleasesOrTags,
	],
	exclude: [
		pageDetect.isEmptyRepoRoot,
		pageDetect.isSingleTag,
	],
	deduplicate: 'has-rgh-inner',
	awaitDomReady: true,
	init,
});
