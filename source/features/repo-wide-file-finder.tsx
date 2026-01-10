import {$optional} from 'select-dom/strict.js';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import getDefaultBranch from '../github-helpers/get-default-branch.js';
import {buildRepoURL} from '../github-helpers/index.js';
import getCurrentGitRef from '../github-helpers/get-current-git-ref.js';
import {registerHotkey} from '../github-helpers/hotkey.js';
import {expectToken} from '../github-helpers/github-token.js';

async function init(signal: AbortSignal): Promise<void> {
	await expectToken();
	const ref = getCurrentGitRef() ?? await getDefaultBranch();
	const url = buildRepoURL('tree', ref) + '?search=1';
	registerHotkey('t', url, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepo,
	],
	exclude: [
		() => Boolean($optional(['[data-hotkey="t"]', '[data-hotkey="t,Shift+T"]'])),
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
