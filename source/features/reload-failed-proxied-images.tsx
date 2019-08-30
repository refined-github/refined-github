import select from 'select-dom';
import features from '../libs/features';

// This feature tries to fix the problem with the broken badges on GitHub
// You can read more on a related issue here https://github.com/badges/shields/issues/1568

// Reload Constants
const ReloadTryInterval = 1000;
const ReloadMaxTries = 4;

// Check if image is from the GitHub's proxy
function isGithubProxiedImg(image: HTMLImageElement): boolean {
	return (/^https:\/\/camo\.githubusercontent\.com\/.*/).test(image.src);
}
// Check if image has zero dimensions
function isZeroSizeImg(image: HTMLImageElement): boolean {
	return (image.naturalHeight === 0 && image.naturalWidth === 0);
}

// Test if image loads correctly, and reload it if there is an error
function test(image: HTMLImageElement): void {
	// Check if image is on page's DOM
	if (!document.contains(image) || !isZeroSizeImg(image)) {
		return;
	}

	// Clone image object to check if image loads with no problems
	// We need to clone the element so that we can later replace it on the page
	const tester = image.cloneNode(false) as HTMLImageElement;

	// Handle successful loading
	tester.addEventListener('load', () => {
		// If image on page is not loaded
		if (isZeroSizeImg(image) && image.parentNode) {
			// Update image
			// Updating the image in an other way may result on an addition request if it is not cached
			image.parentNode.replaceChild(tester, image);
		}
	});

	// Handle failure of loading the image
	// (maybe, the original image source failed to provide the image to the proxy in the 4 seconds time-frame)
	tester.addEventListener('error', () => {
		let tries = parseInt(image.dataset.brokenProxiedImage || '0', 10);

		// Limit max tries
		if (tries > ReloadMaxTries) {
			// Here we could also try to directly load the image from the `image.dataset.canonicalSrc`
			// but this will expose the user to the server that hosts the image
			return;
		}

		// Update tries
		image.dataset.brokenProxiedImage = String(++tries);

		// Try again later
		setTimeout(() => {
			test(image);
		}, ReloadTryInterval);
	});

	// Start testing
	tester.src = image.src;
}

async function init(): Promise<false | void> {
	// Get each image on the page
	select.all('img').forEach(image => {
		// If it is a proxied image
		if (isGithubProxiedImg(image)) {
			test(image);
		}
	});
}

features.add({
	id: __featureName__,
	description: 'Auto reload failed GitHub proxied images',
	screenshot: false,
	load: features.onAjaxedPages,
	init
});
