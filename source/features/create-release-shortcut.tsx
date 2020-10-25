import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function addQuickSubmit(): void {
	select('textarea[aria-label="Describe this release"]')?.classList.add('js-quick-submit');
}

function init(): void {
	const createReleaseButton = select('a[href$="/releases/new"]:not([data-hotkey])');
	if (createReleaseButton) {
		createReleaseButton.dataset.hotkey = 'c';
	}
}

void features.add(__filebasename, {
	shortcuts: {
		c: 'Create a new release',
		'ctrl enter': 'Publish a release'
	},
	include: [
		pageDetect.isReleasesOrTags
	],
	init
}, {
	include: [
		pageDetect.isReleasesOrTags, // If the release couldn't be published, GitHub changes the url to /releases while still being on the "New release" page
		pageDetect.isNewRelease,
		pageDetect.isEditingRelease
	],
	init: addQuickSubmit
});
