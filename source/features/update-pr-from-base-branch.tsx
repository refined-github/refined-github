import React from 'dom-chef';
import select from 'select-dom';

import * as pageDetect from 'github-url-detection';
import delegate, { DelegateEvent } from 'delegate-it';

import {CheckIcon} from '@primer/octicons-react';

import features from '../feature-manager';
import observe from '../helpers/selector-observer';
import * as api from '../github-helpers/api';
import {getBranches} from '../github-helpers/pr-branches';
import getPrInfo from '../github-helpers/get-pr-info';
import {getConversationNumber} from '../github-helpers';
import showToast from '../github-helpers/toast';
import createMergeabilityRow from '../github-widgets/mergeability-row';

const canMerge = '.merge-pr > .color-fg-muted:first-child';
const canNativelyUpdate = '.js-update-branch-form'

async function mergeBranches(): Promise<AnyObject> {
	return api.v3(`pulls/${getConversationNumber()!}/update-branch`, {
		method: 'PUT',
		ignoreHTTPStatus: true,
	});
}

async function handler(event: DelegateEvent<MouseEvent, HTMLButtonElement>): Promise<void> {
	event.delegateTarget.disabled = true;
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

async function addButton(mergeBar: Element): Promise<void> {
	if (!select.exists(canMerge) || select.exists(canNativelyUpdate)) {
		return;
	}

	const {base, head} = getBranches();
	const prInfo = await getPrInfo(base.local, head.local);
	if (!prInfo) {
		return;
	}

	if (prInfo.viewerCanEditFiles && prInfo.mergeable !== 'CONFLICTING') {
		mergeBar.before(createMergeabilityRow({
			action: <button type="button" className="btn rgh-update-pr-from-base-branch">Update branch</button>,
			icon: <CheckIcon/>,
			iconClass: 'completeness-indicator-success',
			heading: 'This branch has no conflicts with the base branch',
		}));
	}
}

async function init(signal: AbortSignal): Promise<false | void> {
	await api.expectToken();

	delegate(document, '.rgh-update-pr-from-base-branch', 'click', handler, {signal});
	observe('.merge-message', addButton, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRConversation,
	],
	exclude: [
		pageDetect.isClosedPR,
		() => select('.head-ref')!.title === 'This repository has been deleted',
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
