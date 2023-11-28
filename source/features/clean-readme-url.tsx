import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';

function getCleanUrlOrNothing(url: string): string | undefined {
	const parsed = new URL(url);
	if (parsed.searchParams.get('tab') === 'readme-ov-file') {
		parsed.searchParams.delete('tab');
		return parsed.href;
	}
}

function onNavigation(event: NavigateEvent) {
	const url = getCleanUrlOrNothing(event.destination.url);
	if (url) {
		event.intercept({
			// DO ME
		});
	}
}

function init(signal: AbortSignal): void {
	const url = getCleanUrlOrNothing(location.href);
	if (url) {
		history.replaceState(history.state, '', url);
	}

	globalThis.navigation?.addEventListener('navigate', onNavigation, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoHome,
	],
	init,
});
