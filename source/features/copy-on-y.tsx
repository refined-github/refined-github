import features from '../feature-manager';
import {isEditable} from '../helpers/dom-utils';

async function handler({key, target}: KeyboardEvent): Promise<void> {
	if (key === 'y' && !isEditable(target)) {
		await navigator.clipboard.writeText(location.href);
		console.log('Copied URL to the clipboard', location.href);
	}
}

function init(signal: AbortSignal): void {
	window.addEventListener('keyup', handler, {signal});
}

void features.add(import.meta.url, {
	awaitDomReady: false,
	init,
});
