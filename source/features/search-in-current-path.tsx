import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import GitHubURL from '../github-helpers/github-url';

let search = '';

function init(): void {
	const searchInput = select<HTMLInputElement>('[data-hotkey="s,/"]')!;

	if (searchInput.value === search) {
		const {route, filePath} = new GitHubURL(location.href);
		
		if (route === 'tree') {
			searchInput.value = `path:${filePath} `;
		} else if (filePath.includes('/')) { // Exclude files at the root
			searchInput.value = `path:${filePath.slice(0, filePath.lastIndexOf('/'))} `;
		}
	}
}

void features.add({
	id: __filebasename,
	description: 'Adds current path to the search box.',
	screenshot: 'https://user-images.githubusercontent.com/44045911/94982458-1cf00c00-056d-11eb-852a-4326042354b2.gif'
}, {
	repeatOnBackButton: true,
	include: [
		pageDetect.isRepoTree,
		pageDetect.isSingleFile
	],
	exclude: [
		pageDetect.isRepoRoot
	],
	init
});
