/**
@description Drops redundant "readme-ov-file" parameter from repo URLs.
@screenshot https://github.com/refined-github/refined-github/assets/1402241/73e96411-3314-4501-a9b6-d006af6fcc47
*/

import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import delay from '../helpers/delay.js';

async function maybeCleanUrl(): Promise<void> {
	const parsed = new URL(location.href);
	if (parsed.searchParams.get('tab') !== 'readme-ov-file') {
		return;
	}

	// GitHub has some delayed logic to deal with this internally
	// https://github.com/refined-github/refined-github/issues/9908
	await delay(500);
	parsed.searchParams.delete('tab');
	history.replaceState(history.state, '', parsed.href);
}

function init(signal: AbortSignal): void {
	void maybeCleanUrl();

	// TODO [2027-01-01]: Only needed to avoid breaking on Safari <26.2 (<2026)
	navigation?.addEventListener('navigatesuccess', maybeCleanUrl, {signal});
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
