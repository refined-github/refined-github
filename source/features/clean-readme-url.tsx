import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';

function getCleanUrlOrNothing(url: string): string | void {
	const parsed = new URL(url);
	if (parsed.searchParams.get('tab') === 'readme-ov-file') {
		parsed.searchParams.delete('tab');
		return parsed.href;
	}
}

function maybeCleanCurrentUrl(url: string): void {
	const cleanedUrl = getCleanUrlOrNothing(url);
	if (cleanedUrl) {
		console.log('cleaning URL', url, '->', cleanedUrl);

		history.replaceState(history.state, '', cleanedUrl);
	}
}

function onNavigation(event: NavigateEvent): void {
	console.log('onNavigation', event.destination.url, event);

	maybeCleanCurrentUrl(event.destination.url);
}

function init(signal: AbortSignal): void {
	maybeCleanCurrentUrl(location.href);
	window.navigation?.addEventListener('navigate', onNavigation, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoHome,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github?tab=readme-ov-file

*/
