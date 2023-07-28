import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import GitHubURL from '../github-helpers/github-url.js';

function setSearchParameter(anchorElement: HTMLAnchorElement, name: string, value: string): void {
	const parameters = new URLSearchParams(anchorElement.search);
	parameters.set(name, value);
	anchorElement.search = String(parameters);
}

async function addForRepositoryActions(prLink: HTMLAnchorElement): Promise<void> {
	const prNumber = prLink.textContent!.slice(1);

	const runLink = prLink.closest('.Box-row')!.querySelector('a.Link--primary')!;
	setSearchParameter(runLink, 'pr', prNumber);
}

async function addForPR(actionLink: HTMLAnchorElement): Promise<void> {
	const {branch: prNumber} = new GitHubURL(location.href);
	setSearchParameter(actionLink, 'pr', prNumber);
}

async function initForRepositoryActionsPage(signal: AbortSignal): Promise<void> {
	observe('div.Box-row[id^=check_suite_] a[data-hovercard-type="pull_request"]', addForRepositoryActions, {signal});
}

async function initForPRPage(signal: AbortSignal): Promise<void> {
	observe('div.js-timeline-item details.commit-build-statuses div.merge-status-item:has(a[href="/apps/github-actions"]) a.status-actions', addForPR, {signal});
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

*/
