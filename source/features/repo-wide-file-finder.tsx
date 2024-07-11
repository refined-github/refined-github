import {elementExists} from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import getDefaultBranch from '../github-helpers/get-default-branch.js';
import {buildRepoURL} from '../github-helpers/index.js';
import getCurrentGitRef from '../github-helpers/get-current-git-ref.js';
import {registerHotkey} from '../github-helpers/hotkey.js';

async function init(signal: AbortSignal): Promise<void> {
	const ref = getCurrentGitRef() ?? await getDefaultBranch();
	const url = buildRepoURL('tree', ref) + '?search=1';
	registerHotkey('t', url, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepo,
	],
	exclude: [
		() => elementExists('[data-hotkey="t"]'),
		pageDetect.isEmptyRepo,
		pageDetect.isPRFiles,
		pageDetect.isFileFinder,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github/actions

*/
