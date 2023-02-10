import React from 'dom-chef';
import select from 'select-dom';
import splitOnFirst from 'split-on-first';
import {AlertIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';
import delegate, {DelegateEvent} from 'delegate-it';

import features from '../feature-manager';
import observe from '../helpers/selector-observer';
import * as api from '../github-helpers/api';
import getPrInfo from '../github-helpers/get-pr-info';
import {getConversationNumber} from '../github-helpers';

const selectorForPushablePRNotice = '.merge-pr > .color-fg-muted:first-child';

type PrReference = {
	/** @example fregante/mem:main */
	full: string;

	/** @example "main" on same-repo PRs, "fregante:main" on cross-repo PRs  */
	local: string;

	/** @example fregante */
	owner: string;

	/** @example mem */
	name: string;

	/** @example main */
	branch: string;
};

function parseReference(referenceElement: HTMLElement): PrReference {
	const {title: full, textContent: local} = referenceElement;
	const [nameWithOwner, branch] = splitOnFirst(full, ':') as [string, string];
	const [owner, name] = nameWithOwner.split(':');
	return {full, owner, name, branch, local: local!.trim()};
}

// TODO: Use in more places, like anywhere '.base-ref' appears
export function getBranches(): {base: PrReference; head: PrReference} {
	return {
		base: parseReference(select('.base-ref')!),
		head: parseReference(select('.head-ref')!),
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
	if (!confirm(`Merge the ${base.local} branch into ${head.local}?`)) {
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
