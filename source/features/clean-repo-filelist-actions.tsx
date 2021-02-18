import React from 'dom-chef';
import onetime from 'onetime';
import {observe} from 'selector-observer';
import {PlusIcon, SearchIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

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
				addButtonText.parentElement!.classList.add('tooltipped', 'tooltipped-ne');
				addButtonText.parentElement!.setAttribute('aria-label', 'Add file');

				addButtonText.classList.replace('d-md-flex', 'd-md-block');
				addButtonText.firstChild!.replaceWith(<PlusIcon/>);
			}
		}
	});

	observe('get-repo summary:not(.rgh-clean-actions)', {
		add(button) {
			button.classList.add('tooltipped', 'tooltipped-ne', 'rgh-clean-actions');
			button.setAttribute('aria-label', 'Clone, open or download');

			button.firstElementChild!.nextSibling!.remove();
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
