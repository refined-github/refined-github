import delay from 'delay';
import onetime from 'onetime';
import loadImage from 'image-promise';
import delegate, {DelegateEvent} from 'delegate-it';

import features from '.';

async function handleErroredImage({delegateTarget}: DelegateEvent<ErrorEvent, HTMLImageElement>): Promise<void> {
	await delay(5000);
	try {
		// A clone image retries downloading
		// `loadImage` awaits it
		// If successfully loaded, the failed image will be replaced.
		delegateTarget.replaceWith(await loadImage(delegateTarget.cloneNode()));
	} catch {}
}

function init(): void {
	delegate(document, 'img[src^="https://camo.githubusercontent.com/"]', 'error', handleErroredImage, {capture: true});
}

void features.add(import.meta.url, {
	deduplicate: 'has-rgh',
	init: onetime(init),
});
