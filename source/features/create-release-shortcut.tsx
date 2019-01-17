import select from 'select-dom';
import features from '../libs/features';

function init() {
	const createReleaseButton = select('a[href$="/releases/new"]:not([data-hotkey])');
	if (createReleaseButton) {
		createReleaseButton.setAttribute('data-hotkey', 'c');
	}
}

features.add({
	id: 'create-release-shortcut',
	include: [
		features.isReleasesOrTags
	],
	load: features.onAjaxedPages,
	shortcuts: {
		c: 'Create a new release'
	},
	init
});
