import features from '../feature-manager.js';
import {isEditable} from '../helpers/dom-utils.js';

async function handler({key, target}: KeyboardEvent): Promise<void> {
	if (key === 'y' && !isEditable(target)) {
		const url = location.href;
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
