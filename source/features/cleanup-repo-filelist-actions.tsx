import React from 'dom-chef';
import select from 'select-dom';
import PlusIcon from 'octicon/plus.svg';
import SearchIcon from 'octicon/search.svg';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {groupButtons} from '../github-helpers/group-buttons';

function init(): void {
	const searchButton = select('.btn[data-hotkey="t"]')!;
	searchButton.classList.remove('mr-2');
	searchButton.firstChild!.replaceWith(<SearchIcon/>);

	const addButtonWrapper = searchButton.nextElementSibling!;
	const addButton = select('summary > span:first-child', addButtonWrapper)!;
	addButton.classList.replace('d-md-flex', 'd-md-block');
	addButton.classList.remove('ml-2');
	const addText = addButton.firstChild!;
	addText.nextSibling!.remove();
	addText.replaceWith(<PlusIcon/>);

	select('summary.btn', addButtonWrapper.nextElementSibling!)?.childNodes[2].remove();

	groupButtons([searchButton, addButtonWrapper]);
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
