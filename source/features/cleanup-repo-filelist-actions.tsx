import React from 'dom-chef';
import select from 'select-dom';
import PlusIcon from 'octicon/plus.svg';
import SearchIcon from 'octicon/search.svg';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {groupButtons} from '../github-helpers/group-buttons';

function init(): void {
	const searchButton = select('.btn[data-hotkey="t"]')!;
	searchButton.classList.add('tooltipped', 'tooltipped-ne');
	searchButton.classList.remove('mr-2');
	searchButton.setAttribute('aria-label', 'Go to file');
	searchButton.firstChild!.replaceWith(<SearchIcon/>);

	const addButtonWrapper = searchButton.nextElementSibling!;
	addButtonWrapper.classList.add('tooltipped', 'tooltipped-ne');
	addButtonWrapper.setAttribute('aria-label', 'Add file');
	const addButton = select('.dropdown-caret', addButtonWrapper)!.parentElement!;
	addButton.classList.add('d-md-block');
	addButton.classList.remove('d-md-flex', 'ml-2');
	addButton.textContent = '';
	addButton.append(<PlusIcon/>);

	groupButtons([searchButton, addButtonWrapper]);

	const downloadButton = select('get-repo details');
	if (downloadButton) {
		downloadButton.classList.add('tooltipped', 'tooltipped-ne');
		downloadButton.setAttribute('aria-label', 'Download');
		select('.octicon-download', downloadButton)!.nextSibling!.remove();
	}
}

void features.add({
	id: __filebasename,
	description: 'Replaces the labels of some simple buttons on repository filelists with icons, making them take less space.',
	screenshot: 'https://user-images.githubusercontent.com/44045911/88551471-7a3f7c80-d055-11ea-82f1-c558b7871824.png'
}, {
	include: [
		pageDetect.isRepoTree
	],
	init
});
