import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import select from "select-dom";
import GitHubURL from "../github-helpers/github-url.js";

function setSearchParam(anchorElement: HTMLAnchorElement, name: string, value: string) {
	const params = new URLSearchParams(anchorElement.search);
	params.set(name, value)
	anchorElement.search = String(params)
}

async function addForRepositoryActions(prLink: HTMLAnchorElement): Promise<void> {
	const prNumber = prLink.textContent!.slice(1);

	const runLink = prLink.closest('.Box-row')!.querySelector('a.Link--primary')!;
	setSearchParam(runLink, 'pr', prNumber)
}

async function addForPR(dropdown: HTMLDivElement): Promise<void> {
	const {branch: prNumber} = new GitHubURL(location.href);
	const actions = select.all('div.merge-status-item:has(a[href="/apps/github-actions"]) a.status-actions', dropdown)

	for(const action of actions) {
		setSearchParam(action, 'pr', prNumber);
	}
}

async function initForRepositoryActionsPage(signal: AbortSignal): Promise<void> {
	observe('div.Box-row[id^=check_suite_] a[data-hovercard-type="pull_request"]', addForRepositoryActions, {signal});
}

async function initForPRPage(signal: AbortSignal): Promise<void> {
	observe('div.js-timeline-item details.commit-build-statuses > div.dropdown-menu > div.branch-action-item', addForPR, {signal});
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
	init: initForPRPage
});

/*

## Test URLs

https://github.com/refined-github/refined-github/actions

https://github.com/refined-github/refined-github/pull/6794

*/
