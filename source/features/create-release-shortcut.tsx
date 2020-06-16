import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function addQuickSubmit(): void {
	// Adding a class of `js-quick-submit` enables the control/meta + enter to submit the release
	select('textarea[aria-label="Describe this release"]')?.classList.add('js-quick-submit');
}

function init(): void {
	const createReleaseButton = select('a[href$="/releases/new"]:not([data-hotkey])');
	if (createReleaseButton) {
		createReleaseButton.dataset.hotkey = 'c';
	}
}

void features.add({
	id: __filebasename,
	description: 'Adds a keyboard shortcut to create a new release while on the Releases page: `c`.',
	screenshot: false,
	shortcuts: {
		c: 'Create a new release'
	}
}, {
	include: [
		pageDetect.isReleasesOrTags
	],
	init
}, {
	include: [
		pageDetect.isReleasesOrTags, // If the release failed to publish, GitHub changes the url to /releases
		pageDetect.isNewRelease,
		pageDetect.isEditingRelease
	],
	init: addQuickSubmit
});
