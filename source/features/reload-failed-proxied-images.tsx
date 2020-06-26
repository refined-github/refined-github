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

function init(): void {
	delegate(document, 'img[src^="https://camo.githubusercontent.com/"]', 'error', handleErroredImage, true);
}

void features.add({
	id: __filebasename,
	description: 'Retries downloading images that failed downloading due to GitHub limited proxying.',
	screenshot: 'https://user-images.githubusercontent.com/14858959/64068746-21991100-cc45-11e9-844e-827f5ac9b51e.png'
}, {
	init
});
