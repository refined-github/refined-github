import * as pageDetect from 'github-url-detection';
import delay from 'delay';

import features from '../feature-manager.js';
import GitHubFileURL from '../github-helpers/github-file-url.js';
import {scrollIntoViewIfNeeded} from '../github-helpers/index.js';

async function init(): Promise<void | false> {
	// The sidebar is loaded a bit later
	await delay(500);

	const {filePath} = new GitHubFileURL(location.href);

	// eslint-disable-next-line unicorn/prefer-query-selector -- `querySelector` requires escaping
	const item = document.getElementById(`${filePath}-item`);
	if (item) {
		scrollIntoViewIfNeeded(item);
	} else {
		return false;
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoTree,
		pageDetect.isSingleFile,
	],
	exclude: [
		pageDetect.isRepoRoot,
	],
	awaitDomReady: true,
	init,
});

/*

Test URLs:

- https://github.com/refined-github/refined-github/blob/main/source/features/mark-private-repos.css
- https://github.com/refined-github/refined-github/tree/main/test/web-ext-profile

*/
