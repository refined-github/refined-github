import './tags-dropdown.css';
import React from 'dom-chef';
import select from 'select-dom';
import {OctofaceIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {buildRepoURL} from '../github-helpers';

// We're reusing the Branch/Tag selector from the repo's Code tab, so we need to update a few things
function changeTabToTags(): void {
	// Select "Tags" tab
	select('.rgh-tags-dropdown button.SelectMenu-tab:last-child')!.click();
}

function updateLinksToTag(): void {
	// Change links, which point to the content of each tag, to open the tag page instead
	for (const anchorElement of select.all('a.rgh-tags-dropdown #tags-menu a.SelectMenu-item[href*="/tree/"]')) {
		const pathnameParts = anchorElement.pathname.split('/');
		pathnameParts[3] = 'releases/tag'; // Replace `tree`
		anchorElement.pathname = pathnameParts.join('/');
	}
}

function init(): void {
	select('.subnav')!.append(
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
						<OctofaceIcon/>
					</include-fragment>
				</details-menu>
			</details>
		</div>
	);

	// https://github.com/github/remote-input-element#events
	// Wait until the network request is finished and HTML body is updated
	// "remote-input-success" event is bubbled
	select('.rgh-tags-dropdown')!.addEventListener('remote-input-success', updateLinksToTag);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isReleasesOrTags
	],
	exclude: [
		pageDetect.isEmptyRepoRoot
	],
	init
});
