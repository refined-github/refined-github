import select from 'select-dom';
import features from '../libs/features';

function init(): void {
	const createReleaseButton = select('a[href$="/releases/new"]:not([data-hotkey])');
	if (createReleaseButton) {
		createReleaseButton.setAttribute('data-hotkey', 'c');
	}
}

features.add({
	id: 'create-release-shortcut',
	description: 'Add keyboard shortcut to quickly create a new release',
	include: [
		features.isReleasesOrTags
	],
	load: features.onAjaxedPages,
	shortcuts: {
		c: 'Create a new release'
	},
	init
});
