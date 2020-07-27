import React from 'dom-chef';
import select from 'select-dom';
import PlusIcon from 'octicon/plus.svg';
import SearchIcon from 'octicon/search.svg';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {groupButtons} from '../github-helpers/group-buttons';

function init(): void {
	const searchButton = select('.file-navigation a.btn.d-md-block')!;
	searchButton.classList.remove('mr-2');
	searchButton.childNodes[0].replaceWith(<SearchIcon/>);

	const addButton = select('.file-navigation .d-md-flex.flex-items-center')!;
	addButton.classList.replace('d-md-flex', 'd-md-block');
	addButton.classList.remove('ml-2');
	addButton.childNodes[0].replaceWith(<PlusIcon/>);

	groupButtons([searchButton, addButton]);

	select('.file-navigation .btn.btn-primary')?.childNodes[2].remove();
}

void features.add({
	id: __filebasename,
	description: 'Replace some button texts with icons.',
	screenshot: ''
}, {
	include: [
		pageDetect.isRepoTree
	],
	init
});
