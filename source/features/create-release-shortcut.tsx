import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import {registerHotkey} from '../github-helpers/hotkey';
import addQuickSubmit from './submission-via-ctrl-enter-everywhere';
import {buildRepoURL} from '../github-helpers';

function init(): void {
	registerHotkey('c', buildRepoURL('releases/new'));
}

void features.add(import.meta.url, {
	shortcuts: {
		c: 'Create a new release',
		'ctrl enter': 'Publish a release',
	},
	include: [
		pageDetect.isReleasesOrTags,
	],
	init,
}, {
	include: [
		pageDetect.isNewRelease,
		pageDetect.isEditingRelease,
	],
	init: addQuickSubmit,
});

/*

Test URLs

https://github.com/refined-github/refined-github/releases
https://github.com/refined-github/sandbox/releases/new
https://github.com/refined-github/sandbox/releases/tag/cool

*/
