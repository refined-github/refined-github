import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import copyToClipboard from 'copy-text-to-clipboard';

import features from '.';

const handler = ({key, target}: KeyboardEvent): void => {
	if (key === 'y' && (target as Element).nodeName !== 'INPUT') {
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
	screenshot: false
}, {
	include: [
		pageDetect.isSingleFile
	],
	waitForDomReady: false,
	repeatOnAjaxEvenOnBackButton: true,
	init,
	deinit
});
