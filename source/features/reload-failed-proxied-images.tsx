import delay from 'delay';
import delegate from 'delegate-it';
import loadImage from 'image-promise';

import features from '.';

async function handleErroredImage({delegateTarget}: delegate.Event<ErrorEvent, HTMLImageElement>): Promise<void> {
	await delay(5000);
	try {
		// A clone image retries downloading
		// `loadImage` awaits it
		// If successfully loaded, the failed image will be replaced.
		delegateTarget.replaceWith(await loadImage(delegateTarget.cloneNode()));
	} catch {}
}

function init(): Deinit {
	return delegate(document, 'img[src^="https://camo.githubusercontent.com/"]', 'error', handleErroredImage, true);
}

void features.add(import.meta.url, {
	init,
});
