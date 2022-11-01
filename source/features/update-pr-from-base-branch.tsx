import React from 'dom-chef';
import select from 'select-dom';
import {AlertIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';
import delegate, {DelegateEvent} from 'delegate-it';

import features from '../feature-manager';
import observe from '../helpers/selector-observer';
import * as api from '../github-helpers/api';
import getPrInfo from '../github-helpers/get-pr-info';
import pluralize from '../helpers/pluralize';
import {buildRepoURL, getConversationNumber} from '../github-helpers';

const selectorForPushablePRNotice = '.merge-pr > .color-fg-muted:first-child';

function getBranches(): {base: string; head: string} {
	return {
		base: select('.base-ref')!.textContent!.trim(),
		head: select('.head-ref')!.textContent!.trim(),
	};
}

async function mergeBranches(): Promise<AnyObject> {
	return api.v3(`pulls/${getConversationNumber()!}/update-branch`, {
		method: 'PUT',
		ignoreHTTPStatus: true,
	});
}

async function handler({delegateTarget}: DelegateEvent): Promise<void> {
	const {base, head} = getBranches();
	if (!confirm(`Merge the ${base} branch into ${head}?`)) {
		return;
	}

	const statusMeta = delegateTarget.parentElement!;
	statusMeta.textContent = 'Updating branch…';
	features.unload(import.meta.url);

	const response = await mergeBranches();
	if (response.ok) {
		statusMeta.remove();
	} else {
		statusMeta.textContent = response.message ?? 'Error';
		statusMeta.prepend(<AlertIcon/>, ' ');
		throw new api.RefinedGitHubAPIError('update-pr-from-base-branch: ' + JSON.stringify(response));
	}
}

async function addButton(position: Element): Promise<void> {
	const {base, head} = getBranches();
	const prInfo = await getPrInfo(base, head);

	if (!prInfo.needsUpdate) {
		return;
	}

	position.append(' ', (
		<span className="status-meta d-inline-block">
			{select('.head-ref')!.cloneNode(true)} is {pluralize(prInfo.headRef.compare.behindBy, '$$ commit', '$$ commits')} behind {select('.base-ref')!.cloneNode(true)}
			{' ('}<a className="btn-link" href={buildRepoURL('commits/' + prInfo.baseRefOid)}>{prInfo.baseRefOid.slice(0, 8)}</a>)
			<button type="button" className="btn-link rgh-update-pr-from-base-branch">update branch</button>.
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
	init,
});

/*
Test URLs

PR without conflicts
https://github.com/refined-github/sandbox/pull/11

Native "Resolve conflicts" button
https://github.com/refined-github/sandbox/pull/9
*/
