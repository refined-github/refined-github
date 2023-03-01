import React from 'dom-chef';
import select from 'select-dom';

import * as pageDetect from 'github-url-detection';
import delegate from 'delegate-it';

import features from '../feature-manager';
import observe from '../helpers/selector-observer';
import * as api from '../github-helpers/api';
import {getBranches} from '../github-helpers/pr-branches';
import getPrInfo from '../github-helpers/get-pr-info';
import {getConversationNumber} from '../github-helpers';
import showToast from '../github-helpers/toast';

const selectorForPushablePRNotice = '.merge-pr > .color-fg-muted:first-child';

async function mergeBranches(): Promise<AnyObject> {
	return api.v3(`pulls/${getConversationNumber()!}/update-branch`, {
		method: 'PUT',
		ignoreHTTPStatus: true,
	});
}

async function handler(): Promise<void> {
	const {base, head} = getBranches();
	if (!confirm(`Merge the ${base.local} branch into ${head.local}?`)) {
		return;
	}

	features.unload(import.meta.url);

	await showToast(async () => {
		const response = await mergeBranches().catch(error => error);
		if (response instanceof Error || !response.ok) {
			features.log.error(import.meta.url, response);
			// Reads Error#message or GitHub’s "message" response
			throw new Error(`Error updating the branch: ${response.message as string}`);
		}
	}, {
		message: 'Updating branch…',
		doneMessage: 'Branch updated',
	});
}

async function addButton(position: Element): Promise<void> {
	const {base, head} = getBranches();
	const prInfo = await getPrInfo(base.local, head.local);
	if (!prInfo) {
		return;
	}

	if (prInfo.viewerCanEditFiles && prInfo.mergeable !== 'CONFLICTING') {
		position.append(' ', (
			<span className="status-meta d-inline-block rgh-update-pr-from-base-branch">
				You can <button type="button" className="btn-link">update the base branch</button>.
			</span>
		));
	}
}

async function init(signal: AbortSignal): Promise<false | void> {
	await api.expectToken();

	delegate(document, '.rgh-update-pr-from-base-branch', 'click', handler, {signal});
	observe(selectorForPushablePRNotice, addButton, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRConversation,
	],
	exclude: [
		pageDetect.isClosedPR,
		() => select('.head-ref')!.title === 'This repository has been deleted',

		// Native button https://github.blog/changelog/2022-02-03-more-ways-to-keep-your-pull-request-branch-up-to-date/
		// TODO: COPY to :has, so it can be hidden dynamically
		() => select.exists('.js-update-branch-form'),
	],
	awaitDomReady: true, // DOM-based exclusions
	init,
});

/*
Test URLs

PR without conflicts
https://github.com/refined-github/sandbox/pull/11

Native "Resolve conflicts" button
https://github.com/refined-github/sandbox/pull/9

Cross-repo PR with long branch names
https://github.com/refined-github/sandbox/pull/13

*/
