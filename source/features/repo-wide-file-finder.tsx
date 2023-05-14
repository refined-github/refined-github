import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import getDefaultBranch from '../github-helpers/get-default-branch.js';
import {buildRepoURL} from '../github-helpers/index.js';
import getCurrentGitRef from '../github-helpers/get-current-git-ref.js';
import {registerHotkey} from '../github-helpers/hotkey.js';

async function init(): Promise<void> {
	registerHotkey('t', buildRepoURL('tree', getCurrentGitRef() ?? await getDefaultBranch()) + '?search=1');
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepo,
	],
	exclude: [
		() => select.exists('[data-hotkey="t"]'),
		pageDetect.isEmptyRepo,
		pageDetect.isPRFiles,
		pageDetect.isFileFinder,
	],
	init,
});
