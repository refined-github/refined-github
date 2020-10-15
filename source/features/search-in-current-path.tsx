import select from 'select-dom';
import onetime from 'onetime';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {getCleanPathname} from '../github-helpers';

let search = '';

function getSearch(): string {
	const path = getCleanPathname().split('/');

	if (pageDetect.isRepoTree() && !pageDetect.isRepoRoot()) {
		return `path:${path.slice(4).join('/')} `;
	}

	if (pageDetect.isSingleFile() && path.length !== 5) {
		return `path:${path.slice(4, -1).join('/')} `;
	}

	return '';
}

function setSearch(): void {
	const searchInput = select<HTMLInputElement>('[data-hotkey="s,/"]')!;

	if (searchInput.value === search) {
		search = getSearch();
		searchInput.value = search;
	}
}

function init(): void {
	setSearch();
	document.addEventListener('pjax:end', setSearch);
}

void features.add({
	id: __filebasename,
	description: 'Adds current path to the search box.',
	screenshot: 'https://user-images.githubusercontent.com/44045911/94982458-1cf00c00-056d-11eb-852a-4326042354b2.gif'
}, {
	include: [
		pageDetect.isRepoTree,
		pageDetect.isSingleFile
	],
	init: onetime(init)
});
