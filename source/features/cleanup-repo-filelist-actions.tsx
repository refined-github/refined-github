import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {PlusIcon, SearchIcon} from '@primer/octicons-react';

import features from '.';

function init(): void {
	const searchButton = $('.btn[data-hotkey="t"]')!;
	searchButton.classList.add('tooltipped', 'tooltipped-ne');
	searchButton.setAttribute('aria-label', 'Go to file');
	searchButton.firstChild!.replaceWith(<SearchIcon/>);

	const addButtonWrapper = searchButton.nextElementSibling!;
	if (addButtonWrapper.nodeName === 'DETAILS') {
		addButtonWrapper.classList.add('tooltipped', 'tooltipped-ne');
		addButtonWrapper.setAttribute('aria-label', 'Add file');

		const addIcon = $('.btn span', addButtonWrapper)!;
		addIcon.classList.replace('d-md-flex', 'd-md-block');
		addIcon.firstChild!.replaceWith(<PlusIcon/>);
	}

	const downloadButton = $('get-repo details');
	if (downloadButton) {
		downloadButton.classList.add('tooltipped', 'tooltipped-ne');
		downloadButton.setAttribute('aria-label', 'Clone or download');
		$('.octicon-download', downloadButton)!.nextSibling!.remove();
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepoTree,
		pageDetect.isSingleFile
	],
	exclude: [
		pageDetect.isEmptyRepo
	],
	init
});
