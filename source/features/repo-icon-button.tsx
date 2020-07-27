import React from 'dom-chef';
import select from 'select-dom';
import PlusIcon from 'octicon/plus.svg';
import SearchIcon from 'octicon/search.svg';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	select('.file-navigation a.btn.d-md-block')!.childNodes[0].replaceWith(<SearchIcon/>);
	const addButton = select('.file-navigation .d-md-flex.flex-items-center')!;
	addButton.classList.replace('d-md-flex', 'd-md-block');
	addButton.childNodes[0].replaceWith(<PlusIcon/>);
	select('.file-navigation .btn.btn-primary')!.childNodes[2].remove();
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
