import * as pageDetect from 'github-url-detection';
import delay from 'delay';

import features from '../feature-manager.js';
import GitHubFileURL from '../github-helpers/github-file-url.js';
import {scrollIntoViewIfNeeded} from '../github-helpers/index.js';

async function init(): Promise<void | false> {
	const {filePath} = new GitHubFileURL(location.href);

	// eslint-disable-next-line unicorn/prefer-query-selector -- `querySelector` requires escaping
	const item = document.getElementById(`${filePath}-item`);
	if (item) {
		// This feature is only needed for the very first load of the view.
		// GitHub does it natively after that.
		scrollIntoViewIfNeeded(item);

		// Try again after a delay because GitHub might have reset the scroll
		// https://github.com/refined-github/refined-github/pull/7848#discussion_r1784041198
		await delay(500);
		scrollIntoViewIfNeeded(item);
	} else {
		// The sidebar might be closed
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
