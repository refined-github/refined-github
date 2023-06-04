import * as pageDetect from 'github-url-detection';
import select from 'select-dom';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

async function add(row: HTMLDivElement): Promise<void> {
	const prNumber = select('a[data-hovercard-type="pull_request"]', row)?.textContent!.slice(1);

	if (prNumber === undefined) {
		return;
	}

	const runLink = select('a.Link--primary', row)!;
	const parameters = new URLSearchParams(runLink.search);
	parameters.set('pr', prNumber);
	runLink.search = String(parameters);
}

async function init(signal: AbortSignal): Promise<void> {
	observe('div.Box-row[id^=check_suite_]', add, {signal});
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
