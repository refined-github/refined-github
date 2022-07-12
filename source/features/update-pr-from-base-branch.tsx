import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import {AlertIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';
import {observe, Observer} from 'selector-observer';

import features from '.';
import * as api from '../github-helpers/api';
import getPrInfo from '../github-helpers/get-pr-info';
import {getConversationNumber} from '../github-helpers';

const selectorForPushablePRNotice = '.merge-pr > :is(.color-text-secondary, .color-fg-muted):first-child:not(.rgh-update-pr)';
let observer: Observer;

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

async function handler({delegateTarget}: delegate.Event): Promise<void> {
	const {base, head} = getBranches();
	if (!confirm(`Merge the ${base} branch into ${head}?`)) {
		return;
	}

	const statusMeta = delegateTarget.parentElement!;
	statusMeta.textContent = 'Updating branch…';
	observer.abort();

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
	const [pr, comparison] = await Promise.all([
		getPrInfo(),

		// TODO: Find how to determine whether the branch needs to be updated via v4
		// `page=10000` avoids fetching any commit information, which is heavy
		api.v3(`compare/${base}...${head}?page=10000`),
	]);

	if (comparison.status === 'diverged' && pr.viewerCanEditFiles && pr.mergeable !== 'CONFLICTING') {
		position.append(' ', (
			<span className="status-meta d-inline-block rgh-update-pr-from-base-branch">
				You can <button type="button" className="btn-link">update the base branch</button>.
			</span>
		));
	}
}

async function init(): Promise<false | Deinit> {
	await api.expectToken();

	// Quick check before using selector-observer on it
	if (!select.exists(selectorForPushablePRNotice)) {
		return false;
	}

	observer = observe(selectorForPushablePRNotice, {
		add(position) {
			position.classList.add('rgh-update-pr');
			void addButton(position);
		},
	});

	return [
		observer,
		delegate(document, '.rgh-update-pr-from-base-branch', 'click', handler),
	];
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRConversation,
	],
	exclude: [
		pageDetect.isClosedPR,
		() => select('.head-ref')!.title === 'This repository has been deleted',

		// Native button https://github.blog/changelog/2022-02-03-more-ways-to-keep-your-pull-request-branch-up-to-date/
		() => select.exists('.js-update-branch-form'),
	],
	deduplicate: 'has-rgh-inner',
	init,
});
