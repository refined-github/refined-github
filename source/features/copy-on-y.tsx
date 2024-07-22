import features from '../feature-manager.js';
import {isEditable} from '../helpers/dom-utils.js';

async function handler({key, target}: KeyboardEvent): Promise<void> {
	if (key === 'y' && !isEditable(target)) {
		const url = location.href;
		// eslint-disable-next-line n/no-unsupported-features/node-builtins -- Until https://github.com/xojs/xo/issues/613
		await navigator.clipboard.writeText(url);
		// Log to ensure we're coping the new URL
		console.log('Copied URL to the clipboard', url);
	}
}

function init(signal: AbortSignal): void {
	window.addEventListener('keyup', handler, {signal});
}

void features.add(import.meta.url, {
	init,
});
// TODO: Add visual popup, maybe use GitHub's own clipboard element

/*

Test URLs

> Any page, particularly it should work copy the permalink when `y` is pressed on:

https://github.com/refined-github/refined-github/blob/main/.gitignore

*/
