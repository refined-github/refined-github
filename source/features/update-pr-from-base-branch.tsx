import React from 'dom-chef';
import select from 'select-dom';

import * as pageDetect from 'github-url-detection';
import delegate from 'delegate-it';

import features from '../feature-manager';
import observe from '../helpers/selector-observer';
import * as api from '../github-helpers/api';
import {getBranches} from '../github-helpers/pr-branches';
import getPrInfo from '../github-helpers/get-pr-info';
import showToast from '../github-helpers/toast';
import pluralize from '../helpers/pluralize';
import {buildRepoURL, getConversationNumber} from '../github-helpers';

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

	if (!prInfo.needsUpdate) {
		return;
	}

	position.append(' ', (
		<span className="status-meta d-inline-block">
			{select('.head-ref')!.cloneNode(true)} is {pluralize(prInfo.behindBy, '$$ commit', '$$ commits')} behind {select('.base-ref')!.cloneNode(true)}
			{' ('}<a className="btn-link" href={buildRepoURL('commits/' + prInfo.baseRefOid)}>{prInfo.baseRefOid.slice(0, 8)}</a>)<button type="button" className="btn-link rgh-update-pr-from-base-branch">update branch</button>.
		</span>
	));
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
