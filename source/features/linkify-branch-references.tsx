import React from 'dom-chef';
import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import GitHubURL from '../github-helpers/github-url';
import {buildRepoURL} from '../github-helpers';

async function init(): Promise<void | false> {
	const element = await elementReady(pageDetect.isQuickPR() ? '.branch-name' : '.commit-form .branch-name');
	if (!element) {
		return false;
	}

	const branchUrl = buildRepoURL('tree', element.textContent!);
	element.replaceWith(
		<span className="commit-ref">
			<a className="no-underline" href={branchUrl} data-pjax="#repo-content-pjax-container">
				{element.textContent}
			</a>
		</span>,
	);
}

const hovercardObserver = new MutationObserver(([mutation]) => {
	const hovercard = (mutation.target as HTMLElement).querySelector('[data-hydro-view*="pull-request-hovercard-hover"] ~ .d-flex.mt-2');
	if (!hovercard) {
		return;
	}

	const {href} = hovercard.querySelector('a.Link--primary')!;

	for (const reference of hovercard.querySelectorAll('.commit-ref')) {
		const url = new GitHubURL(href).assign({
			route: 'tree',
			branch: reference.title,
		});

		const user = reference.querySelector('.user');
		if (user) {
			url.user = user.textContent!;
		}

		reference.replaceChildren(
			<a className="no-underline" href={url.href}>
				{[...reference.childNodes]}
			</a>,
		);
	}
});

function hovercardInit(): void | Deinit {
	const hovercardContainer = select('.js-hovercard-content > .Popover-message');
	if (hovercardContainer) {
		hovercardObserver.observe(hovercardContainer, {childList: true});
		return hovercardObserver.disconnect;
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isQuickPR,
		pageDetect.isEditingFile,
		pageDetect.isDeletingFile,
	],
	init,
}, {
	init: hovercardInit,
});
