import delay from 'delay';
import delegate, {DelegateEvent} from 'delegate-it';
import loadImage from 'image-promise';
import features from '../libs/features';

async function handleErroredImage({delegateTarget}: DelegateEvent<ErrorEvent, HTMLImageElement>): Promise<void> {
	await delay(5000);
	try {
		// A clone image retries downloading
		// `loadImage` awaits it
		// If successfully loaded, the failed image will be replaced.
		delegateTarget.replaceWith(await loadImage(delegateTarget.cloneNode() as HTMLImageElement));
	} catch {}
}

function init(): void {
	delegate('img[src^="https://camo.githubusercontent.com/"]', 'error', handleErroredImage, true);
}

features.add({
	id: __featureName__,
	description: 'Retries downloading images that failed downloading due to GitHub limited proxying.',
	screenshot: 'https://user-images.githubusercontent.com/14858959/64068746-21991100-cc45-11e9-844e-827f5ac9b51e.png',
	load: features.onAjaxedPages,
	init
});
