import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import getDefaultBranch from '../github-helpers/get-default-branch';
import {buildRepoURL, getCurrentCommittish} from '../github-helpers';
import {registerHotkey} from '../github-helpers/hotkey';

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
