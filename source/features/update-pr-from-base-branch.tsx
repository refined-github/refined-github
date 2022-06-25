import React from 'dom-chef';
import select from 'select-dom';
import {AlertIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';
import {observe, Observer} from 'selector-observer';
import delegate, {DelegateEvent} from 'delegate-it';

import features from '.';
import * as api from '../github-helpers/api';
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
		headers: {
			Accept: 'application/vnd.github.lydian-preview+json',
		},
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
	const {status} = await api.v3(`compare/${base}...${head}`);

	if (status === 'diverged') {
		position.append(' ', (
			<span className="status-meta d-inline-block rgh-update-pr-from-base-branch">
				You can <button type="button" className="btn-link">update the base branch</button>.
			</span>
		));
	}
}

async function init(signal: AbortSignal): Promise<false | Deinit> {
	await api.expectToken();

	// "Resolve conflicts" is the native button to update the PR
	if (select.exists('.js-merge-pr a[href$="/conflicts"]')) {
		return false;
	}

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

	delegate(document, '.rgh-update-pr-from-base-branch', 'click', handler, {signal});

	return observer;
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRConversation,
	],
	exclude: [
		pageDetect.isClosedPR,
		() => select('.head-ref')!.title === 'This repository has been deleted',
	],
	deduplicate: 'has-rgh-inner',
	init,
});
