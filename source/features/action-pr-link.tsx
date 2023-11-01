import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {getConversationNumber} from '../github-helpers/index.js';

function setSearchParameter(anchorElement: HTMLAnchorElement, name: string, value: string): void {
	const parameters = new URLSearchParams(anchorElement.search);
	parameters.set(name, value);
	anchorElement.search = String(parameters);
}

async function addForRepositoryActions(prLink: HTMLAnchorElement): Promise<void> {
	const prNumber = prLink.textContent.slice(1);

	const runLink = prLink.closest('.Box-row')!.querySelector('a.Link--primary')!;
	setSearchParameter(runLink, 'pr', prNumber);
}

async function addForPR(actionLink: HTMLAnchorElement): Promise<void> {
	setSearchParameter(actionLink, 'pr', String(getConversationNumber()));
}

async function initForRepositoryActionsPage(signal: AbortSignal): Promise<void> {
	observe('div.Box-row[id^=check_suite_] a[data-hovercard-type="pull_request"]', addForRepositoryActions, {signal});
}

async function initForPRPage(signal: AbortSignal): Promise<void> {
	// Exclude rgh-link, include isPRCommits
	observe('main [href="/apps/github-actions"] ~ div a.status-actions', addForPR, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepositoryActions,
	],
	init: initForRepositoryActionsPage,
}, {
	include: [
		pageDetect.isPR,
	],
	init: initForPRPage,
});

/*

## Test URLs

https://github.com/refined-github/refined-github/actions

https://github.com/refined-github/refined-github/pull/6794

https://github.com/refined-github/refined-github/pull/6794/commits

*/
