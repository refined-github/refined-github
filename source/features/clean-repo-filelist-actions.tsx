import React from 'dom-chef';
import onetime from 'onetime';
import {observe} from 'selector-observer';
import PlusIcon from 'octicon/plus.svg';
import SearchIcon from 'octicon/search.svg';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	observe('.d-flex > [data-hotkey="t"]:not(.rgh-clean-actions)', {
		add(searchButton) {
			searchButton.classList.add('tooltipped', 'tooltipped-ne', 'rgh-clean-actions');
			searchButton.setAttribute('aria-label', 'Go to file');

			searchButton.firstChild!.replaceWith(<SearchIcon/>);

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

void features.add({
	id: __filebasename,
	description: 'Replaces the labels of some simple buttons on repository filelists with icons, making them take less space.',
	screenshot: 'https://user-images.githubusercontent.com/44045911/88551471-7a3f7c80-d055-11ea-82f1-c558b7871824.png'
}, {
	include: [
		pageDetect.isRepoTree,
		pageDetect.isSingleFile
	],
	exclude: [
		pageDetect.isEmptyRepo
	],
	init: onetime(init)
});
