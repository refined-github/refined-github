import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';
import {PlusIcon, SearchIcon} from '@primer/octicons-react';

import {wrap} from '../helpers/dom-utils';
import features from '.';

function init(): void {
	// `.btn` selects the desktop version
	observe('.btn[data-hotkey="t"]:not(.rgh-repo-filelist-actions)', {
		add(searchButton) {
			searchButton.classList.add('tooltipped', 'tooltipped-ne', 'rgh-repo-filelist-actions');
			searchButton.setAttribute('aria-label', 'Go to file');

			// Replace "Go to file" with  icon
			searchButton.firstChild!.replaceWith(<SearchIcon/>);

			// This button doesn't appear on `isSingleFile`
			const addFileDropdown = searchButton.nextElementSibling!.querySelector('.dropdown-caret');
			if (addFileDropdown) {
				addFileDropdown.parentElement!.classList.replace('d-md-flex', 'd-md-block');

				// Replace "Add file" with icon
				addFileDropdown.previousSibling!.replaceWith(<PlusIcon/>);

				// Add tooltip on a wrapper to avoid breaking dropdown functionality
				wrap(addFileDropdown.closest('details')!, <div className="tooltipped tooltipped-ne" aria-label="Add file"/>);
			}

			// This dropdown doesn't appear on `isSingleFile`
			const downloadIcon = select('get-repo .octicon-download');
			if (downloadIcon) {
				downloadIcon.classList.add('rgh-repo-filelist-actions');

				// Remove "Code" text next to it
				downloadIcon.nextSibling!.remove();

				// Add tooltip on a wrapper to avoid breaking dropdown functionality
				wrap(downloadIcon.closest('details')!, <div className="tooltipped tooltipped-ne" aria-label="Clone, open or download"/>);
			}
		}
	});
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepoTree,
		pageDetect.isSingleFile
	],
	init: onetime(init)
});
