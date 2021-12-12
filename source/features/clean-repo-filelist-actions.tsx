import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';
import {PlusIcon, SearchIcon, CodeIcon} from '@primer/octicons-react';

import {wrap} from '../helpers/dom-utils';
import features from '.';

/** Add tooltip on a wrapper to avoid breaking dropdown functionality */
function addTooltipToSummary(childElement: Element, tooltip: string): void {
	wrap(
		childElement.closest('details')!,
		<div className="tooltipped tooltipped-ne" aria-label={tooltip}/>,
	);
}

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

				addTooltipToSummary(addFileDropdown, 'Add file');
			}

			const codeDropdownButton = select('get-repo summary');
			if (codeDropdownButton) { // This dropdown doesn't appear on `isSingleFile`
				addTooltipToSummary(codeDropdownButton, 'Clone, open or download');

				// Users with Codespaces enabled already have an icon in the button https://github.com/refined-github/refined-github/pull/5074#issuecomment-983251719
				const codeIcon = select('.octicon-code', codeDropdownButton);
				if (codeIcon) {
					// Remove "Code" text
					codeIcon.nextSibling!.remove();
				} else {
					// Replace "Code" text with icon
					codeDropdownButton.firstChild!.replaceWith(<CodeIcon/>);
				}
			}
		},
	});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoTree,
		pageDetect.isSingleFile,
	],
	deduplicate: 'has-rgh-inner',
	init: onetime(init),
});
