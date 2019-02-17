/*
Renames Diff Settings to be an icon instead
*/

import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import {gear} from '../libs/icons';

async function init() {
	const diffSettings = select('.pr-review-tools .diffbar-item summary');
	diffSettings.innerText = '';
	diffSettings.append(<span class="data-menu-button">{gear()}</span>);
	const dropdownMenu = diffSettings.nextElementSibling as HTMLElement;
	dropdownMenu.style.left = '-98px';
}

features.add({
	id: 'rename-diff-settings-to-icon',
	include: [
		features.isPRFiles
	],
	load: features.onAjaxedPages,
	init
});
