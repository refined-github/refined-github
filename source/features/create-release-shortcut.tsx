import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import {registerHotkey} from '../github-helpers/hotkey';
import {buildRepoURL} from '../github-helpers';

function init(): void {
	// Reasoning for this feature: #1254
	registerHotkey('c', buildRepoURL('releases/new'));
}

void features.add(import.meta.url, {
	shortcuts: {
		c: 'Create a new release',
	},
	include: [
		pageDetect.isReleasesOrTags,
	],
	exclude: [
		pageDetect.isNewRelease,
		pageDetect.isEditingRelease,
	],
	init,
});

/*

Test URLs

https://github.com/refined-github/refined-github/releases
https://github.com/refined-github/sandbox/releases/new
https://github.com/refined-github/sandbox/releases/tag/cool

*/
