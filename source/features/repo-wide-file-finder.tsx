import * as pageDetect from 'github-url-detection';
import {elementExists} from 'select-dom';

import features from '../feature-manager.js';
import getCurrentGitRef from '../github-helpers/get-current-git-ref.js';
import getDefaultBranch from '../github-helpers/get-default-branch.js';
import {registerHotkey} from '../github-helpers/hotkey.js';
import {buildRepoUrl} from '../github-helpers/index.js';

async function init(signal: AbortSignal): Promise<void> {
	const ref = getCurrentGitRef() ?? await getDefaultBranch();
	const url = buildRepoUrl('tree', ref) + '?search=1';
	registerHotkey('t', url, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepo,
	],
	exclude: [
		// TODO [2026-10-01]: Drop first two selectors
		() => elementExists(['[data-hotkey="t"]', '[data-hotkey="t,Shift+T"]', '[aria-label="Go to file"]']),
		pageDetect.isPRFiles,
		pageDetect.isFileFinder,
	],
	awaitDomReady: true, // DOM-based filters
	requiresToken: true,
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github/actions

*/
