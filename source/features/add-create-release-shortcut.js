import select from 'select-dom';
import features from '../libs/features';
import {registerShortcut} from './improve-shortcut-help';

function init() {
	registerShortcut('releases', 'c', 'Create a new release');
	const createReleaseButton = select('a[href$="/releases/new"]:not([data-hotkey])');
	if (createReleaseButton) {
		createReleaseButton.setAttribute('data-hotkey', 'c');
	}
}

features.add({
	id: 'add-create-release-shortcut',
	include: [
		features.isReleasesOrTags
	],
	load: features.onAjaxedPages,
	init
});
