import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import features from '../libs/features';

function init(): void {
	const createReleaseButton = select('a[href$="/releases/new"]:not([data-hotkey])');
	if (createReleaseButton) {
		createReleaseButton.dataset.hotkey = 'c';
	}
}

features.add({
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
});
