import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';

function maybeCleanUrl(event?: NavigateEvent): void {
	const parsed = new URL(event?.destination.url ?? location.href);
	if (parsed.searchParams.get('tab') === 'readme-ov-file') {
		parsed.searchParams.delete('tab');
		history.replaceState(history.state, '', parsed.href);
	}
}

function init(signal: AbortSignal): void {
	maybeCleanUrl();
	window.navigation?.addEventListener('navigate', maybeCleanUrl, {signal});
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
