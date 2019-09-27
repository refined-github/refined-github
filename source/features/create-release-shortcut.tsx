import select from 'select-dom';
import features from '../libs/features';

function init(): void {
	const createReleaseButton = select('a[href$="/releases/new"]:not([data-hotkey])');
	if (createReleaseButton) {
		createReleaseButton.dataset.hotkey = 'c';
	}
}

features.add({
	id: __featureName__,
	description: 'Adds a keyboard shortcut to create a new release while on the Releases page: `c`.',
	screenshot: false,
	include: [
		features.isReleasesOrTags
	],
	load: features.onAjaxedPages,
	shortcuts: {
		c: 'Create a new release'
	},
	init
});
