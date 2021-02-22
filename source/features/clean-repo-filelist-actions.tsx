import React from 'dom-chef';
import onetime from 'onetime';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';
import {PlusIcon, SearchIcon} from '@primer/octicons-react';

import {wrap} from '../helpers/dom-utils';
import features from '.';

function init(): void {
	// Only select desktop version of the button
	observe('.d-flex > [data-hotkey="t"]:not(.rgh-clean-actions)', {
		add(searchButton) {
			searchButton.classList.add('tooltipped', 'tooltipped-ne', 'rgh-clean-actions');
			searchButton.setAttribute('aria-label', 'Go to file');
			searchButton.firstChild!.replaceWith(<SearchIcon/>);

			// Exclude logged out, mobile or file pages
			const addButtonText = searchButton.nextElementSibling?.querySelector('.d-md-flex');
			if (addButtonText) {
				addButtonText.classList.replace('d-md-flex', 'd-md-block');
				addButtonText.firstChild!.replaceWith(<PlusIcon/>);
				// Add tooltip on a wrapper to avoid breaking dropdown functionality
				wrap(addButtonText.closest('details')!, <div className="tooltipped tooltipped-ne" aria-label="Add file"/>);
			}
		}
	});

	observe('get-repo summary:not(.rgh-clean-actions)', {
		add(button) {
			button.classList.add('rgh-clean-actions');
			// Remove "Code" text in dropdown button
			button.firstElementChild!.nextSibling!.remove();
			// Add tooltip on a wrapper to avoid breaking dropdown functionality
			wrap(button.closest('details')!, <div className="tooltipped tooltipped-ne" aria-label="Clone, open or download"/>);
		}
	});
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepoTree,
		pageDetect.isSingleFile
	],
	exclude: [
		pageDetect.isEmptyRepo
	],
	init: onetime(init)
});
