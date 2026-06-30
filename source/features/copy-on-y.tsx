import features from '../feature-manager.js';
import {isEditable} from '../helpers/dom-utils.js';
import showOverlay from '../helpers/overlay.js';

async function handler({key, target}: KeyboardEvent): Promise<void> {
	if (!(key === 'y' && !isEditable(target))) {
		return;
	}

	const url = location.href;
	await navigator.clipboard.writeText(url);
	// Log to ensure we're coping the new URL
	console.log('Copied URL to the clipboard', url);
	await showOverlay('Permalink copied to clipboard');
}

function init(signal: AbortSignal): void {
	addEventListener('keyup', handler, {signal});
}

void features.add(import.meta.url, {
	init,
	shortcuts: {
		y: 'Copy permalink to clipboard',
	},
});

/*

Test URLs

> Any page, particularly it should work copy the permalink when `y` is pressed on:

https://github.com/refined-github/refined-github/blob/main/.gitignore

*/
