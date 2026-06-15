import features from '../feature-manager.js';
import showToast from '../github-helpers/toast.js';
import {isEditable} from '../helpers/dom-utils.js';

async function handler({key, target}: KeyboardEvent): Promise<void> {
	if (key === 'y' && !isEditable(target)) {
		const url = location.href;
		showToast(navigator.clipboard.writeText(url), {
			message: url,
			doneMessage: 'Copied to clipboard',
		});
	}
}

function init(signal: AbortSignal): void {
	globalThis.addEventListener('keyup', handler, {signal});
}

void features.add(import.meta.url, {
	init,
});

/*

Test URLs

> Any page, particularly it should work copy the permalink when `y` is pressed on:

https://github.com/refined-github/refined-github/blob/main/.gitignore

*/
