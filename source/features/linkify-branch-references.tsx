import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import GitHubFileURL from '../github-helpers/github-file-url.js';
import {buildRepoURL} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';

function linkifyQuickPR(element: HTMLElement): void {
	const branchUrl = buildRepoURL('tree', element.textContent);
	element.replaceWith(
		<span className="commit-ref">
			<a className="no-underline" href={branchUrl} data-turbo-frame="repo-content-turbo-frame">
				{element.textContent}
			</a>
		</span>,
	);
}

function linkifyHovercard(hovercard: HTMLElement): void {
	const {href} = hovercard.querySelector('a.Link--primary')!;

	for (const reference of hovercard.querySelectorAll('.commit-ref')) {
		const url = new GitHubFileURL(href).assign({
			route: 'tree',
			branch: reference.title,
		});

		const user = reference.querySelector('.user');
		if (user) {
			url.user = user.textContent;
		}

		reference.replaceChildren(
			<a className="no-underline" href={url.href} data-turbo-frame="repo-content-turbo-frame">
				{[...reference.childNodes]}
			</a>,
		);
	}
}

async function quickPRInit(signal: AbortSignal): Promise<void> {
	observe('.branch-name', linkifyQuickPR, {signal});
}

function hovercardInit(signal: AbortSignal): void {
	observe('[data-hydro-view*="pull-request-hovercard-hover"] ~ .d-flex.mt-2', linkifyHovercard, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isQuickPR,
	],
	init: quickPRInit,
}, {
	init: hovercardInit,
});

/*

Test URLs:

https://github.com/refined-github/sandbox/compare/default-a...quick-pr-branch?quick_pull=1
https://github.com ("Recent activity" box in left sidebar, hover a PR)

*/
