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
			search = `path:${filePath} `;
		} else if (filePath.includes('/')) { // Exclude files at the root
			search = `path:${filePath.slice(0, filePath.lastIndexOf('/'))} `;
		}

		searchInput.value = search;
	}
}

void features.add({
	id: __filebasename,
	description: 'Adds current path to the search box.',
	screenshot: 'https://user-images.githubusercontent.com/44045911/96068679-29f6ee80-0ecf-11eb-8c6b-af2e401dc5bf.gif'
}, {
	include: [
		pageDetect.isRepoTree,
		pageDetect.isSingleFile
	],
	exclude: [
		pageDetect.isRepoRoot
	],
	repeatOnBackButton: true,
	init
});
