import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import delay from '../helpers/delay.js';
import preserveScroll from '../helpers/preserve-scroll.js';

function maybeCleanUrl(): void {
	const parsed = new URL(location.href);
	if (parsed.searchParams.get('tab') !== 'readme-ov-file') {
		return;
	}

	parsed.searchParams.delete('tab');
	// Preserve scroll: replaceState can shift the viewport (#9908)
	const resetScroll = preserveScroll();
	history.replaceState(history.state, '', parsed.href);
	resetScroll();
}

async function init(signal: AbortSignal): Promise<void> {
	// Let GitHub scroll to the readme before stripping the tab (#9908)
	await delay(100, signal);
	maybeCleanUrl();

	let interval: NodeJS.Timeout;
	if ('navigation' in globalThis) {
		// Clean after navigation completes so the sidebar Readme link can scroll first (#9908)
		navigation.addEventListener('navigatesuccess', maybeCleanUrl, {signal});
	} else {
		// TODO [2027-01-01]: Drop setInterval, it's only needed to support Safari <26.2
		interval = setInterval(() => {
			maybeCleanUrl();
		}, 1000);
		signal.addEventListener('abort', () => {
			clearInterval(interval);
		});
	}
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

Also click "Readme" in the repo sidebar on:
https://github.com/refined-github/refined-github

*/
