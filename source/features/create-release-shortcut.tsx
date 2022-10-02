import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import {addHotkey} from '../github-helpers/hotkey';
import addQuickSubmit from './submission-via-ctrl-enter-everywhere';

function init(): void {
	addHotkey(select('a[href$="/releases/new"]'), 'c');
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
