import delay from 'delay';
import onetime from 'onetime';
import loadImage from 'image-promise';
import delegate, {DelegateEvent} from 'delegate-it';

import features from '../feature-manager.js';

async function handleErroredImage({delegateTarget}: DelegateEvent<ErrorEvent, HTMLImageElement>): Promise<void> {
	console.log('Refined GitHub: image failed loading, will retry', delegateTarget.src);

	await delay(5000);
	try {
		// A clone image retries downloading
		// `loadImage` awaits it
		// If successfully loaded, the failed image will be replaced.
		delegateTarget.replaceWith(await loadImage(delegateTarget.cloneNode()));
	} catch {}
}

function init(signal: AbortSignal): void {
	delegate('img[src^="https://camo.githubusercontent.com/"]', 'error', handleErroredImage, {capture: true, signal});
}

void features.add(import.meta.url, {
	init: onetime(init),
});
