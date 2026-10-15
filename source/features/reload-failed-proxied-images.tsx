import delegate, {type DelegateEvent} from 'delegate-it';

import features from '../feature-manager.js';
import delay from '../helpers/delay.js';
import onetime from '../helpers/onetime.js';

const maxRetries = 3;
// Some images (e.g. 404 images) never load, don't retry them forever
const retries = new Map<string, number>();

async function handleErroredImage({delegateTarget}: DelegateEvent<ErrorEvent, HTMLImageElement>): Promise<void> {
	const {src} = delegateTarget;
	const attempts = retries.get(src) ?? 0;
	if (attempts >= maxRetries) {
		console.log('Refined GitHub: image failed loading, giving up', src);
		return;
	}

	retries.set(src, attempts + 1);
	console.log('Refined GitHub: image failed loading, will retry', src);

	await delay(5000);
	try {
		// A clone image retries downloading
		const cloned = delegateTarget.cloneNode();
		await cloned.decode();
		// If successfully loaded, the failed image will be replaced.
		delegateTarget.replaceWith(cloned);
	} catch {}
}

function initOnce(): void {
	delegate('img[src^="https://camo.githubusercontent.com/"]', 'error', handleErroredImage, {capture: true});
}

void features.add(import.meta.url, {
	init: onetime(initOnce),
});

/*

Test URLs:

1. https://github.com/refined-github/sandbox/blob/7416/7416.md
2. See log in console

*/
