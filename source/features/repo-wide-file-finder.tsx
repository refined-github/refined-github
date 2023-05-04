import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import getDefaultBranch from '../github-helpers/get-default-branch.js';
import {buildRepoURL, getCurrentCommittish} from '../github-helpers/index.js';
import {registerHotkey} from '../github-helpers/hotkey.js';

async function init(): Promise<void> {
	registerHotkey('t', buildRepoURL('tree', getCurrentCommittish() ?? await getDefaultBranch()) + '?search=1');
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
