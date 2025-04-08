import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

function fix(button: HTMLAnchorElement): void {
	button.removeAttribute('target');
}

function init(signal: AbortSignal): void {
	// "Closing issue" link
	observe('[data-testid="state-reason-link"] + [target="_blank"]', fix, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isIssue,
	],
	init,
});

/*

Test URLs

- "Closing issue" link https://github.com/refined-github/refined-github/issues/8346#event-16947543136

*/
