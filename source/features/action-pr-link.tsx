import * as pageDetect from 'github-url-detection';
import select from 'select-dom';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

async function add(row: HTMLDivElement): Promise<void> {
	const prNumber = select('a[data-hovercard-type="pull_request"]', row)?.textContent?.slice(1);

	if (prNumber === undefined) {
		return;
	}

	select('a.Link--primary', row)!.href += `?pr=${prNumber}`;
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
