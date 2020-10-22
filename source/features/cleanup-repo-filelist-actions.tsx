import React from 'dom-chef';
import select from 'select-dom';
import PlusIcon from 'octicon/plus.svg';
import SearchIcon from 'octicon/search.svg';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	const searchButton = select('.btn[data-hotkey="t"]')!;
	searchButton.classList.add('tooltipped', 'tooltipped-ne');
	searchButton.setAttribute('aria-label', 'Go to file');
	searchButton.firstChild!.replaceWith(<SearchIcon/>);

	const addButtonWrapper = searchButton.nextElementSibling!;
	if (addButtonWrapper.nodeName === 'DETAILS') {
		addButtonWrapper.classList.add('tooltipped', 'tooltipped-ne');
		addButtonWrapper.setAttribute('aria-label', 'Add file');

		const addIcon = select('.btn span', addButtonWrapper)!;
		addIcon.classList.replace('d-md-flex', 'd-md-block');
		addIcon.firstChild!.replaceWith(<PlusIcon/>);
	}

	const downloadButton = select('get-repo details');
	if (downloadButton) {
		downloadButton.classList.add('tooltipped', 'tooltipped-ne');
		downloadButton.setAttribute('aria-label', 'Clone or download');
		select('.octicon-download', downloadButton)!.nextSibling!.remove();
	}
}

void features.add(__filebasename, {}, {
	include: [
		pageDetect.isRepoTree,
		pageDetect.isSingleFile
	],
	exclude: [
		pageDetect.isEmptyRepo
	],
	init
});
