import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import copyToClipboard from 'copy-text-to-clipboard';

import features from '.';
import {isEditable} from '../helpers/dom-utils';

const handler = ({key, target}: KeyboardEvent): void => {
	if (key === 'y' && !isEditable(target)) {
		const permalink = select<HTMLAnchorElement>('.js-permalink-shortcut')!.href;
		copyToClipboard(permalink + location.hash);
	}
};

function init(): void {
	window.addEventListener('keyup', handler);
}

function deinit(): void {
	window.removeEventListener('keyup', handler);
}

void features.add({
	id: __filebasename,
	description: 'Enhances the `y` hotkey to also copy the permalink.',
	screenshot: 'https://help.github.com/articles/getting-permanent-links-to-files/'
}, {
	include: [
		pageDetect.isSingleFile
	],
	awaitDomReady: false,
	repeatOnBackButton: true,
	init,
	deinit
});
