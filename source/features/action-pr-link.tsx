import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

async function add(prLink: HTMLAnchorElement): Promise<void> {
	const prNumber = prLink.textContent!.slice(1);

	const runLink = prLink.closest('.Box-row')!.querySelector('a.Link--primary')!;
	const parameters = new URLSearchParams(runLink.search);
	parameters.set('pr', prNumber);
	runLink.search = String(parameters);
}

async function init(signal: AbortSignal): Promise<void> {
	observe('div.Box-row[id^=check_suite_] a[data-hovercard-type="pull_request"]', add, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepositoryActions,
	],
	init,
});

/*

## Test URLs

https://github.com/refined-github/refined-github/actions

*/
