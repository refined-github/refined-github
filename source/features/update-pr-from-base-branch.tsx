import React from 'dom-chef';
import {$, elementExists} from 'select-dom';

import * as pageDetect from 'github-url-detection';
import delegate, {DelegateEvent} from 'delegate-it';

import {CheckIcon} from '@primer/octicons-react';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import api from '../github-helpers/api.js';
import {getBranches} from '../github-helpers/pr-branches.js';
import getPrInfo from '../github-helpers/get-pr-info.js';
import showToast from '../github-helpers/toast.js';
import {getConversationNumber} from '../github-helpers/index.js';
import createMergeabilityRow from '../github-widgets/mergeability-row.js';
import selectHas from '../helpers/select-has.js';

const canMerge = '.merge-pr > .color-fg-muted:first-child';
const canNativelyUpdate = '.js-update-branch-form';

async function mergeBranches(): Promise<AnyObject> {
	return api.v3(`pulls/${getConversationNumber()!}/update-branch`, {
		method: 'PUT',
		ignoreHTTPStatus: true,
	});
}

async function handler({delegateTarget: button}: DelegateEvent<MouseEvent, HTMLButtonElement>): Promise<void> {
	button.disabled = true;
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

	button.remove();
}

function createButton(): JSX.Element {
	return (
		<button
			type="button"
			className="btn btn-sm rgh-update-pr-from-base-branch tooltipped tooltipped-sw"
			aria-label="Use Refined GitHub to update the PR from the base branch"
		>
			Update branch
		</button>
	);
}

async function addButton(mergeBar: Element): Promise<void> {
	if (!elementExists(canMerge) || elementExists(canNativelyUpdate)) {
		return;
	}

	const {base} = getBranches();
	const prInfo = await getPrInfo(base.relative);
	if (!prInfo.needsUpdate || !prInfo.viewerCanEditFiles || prInfo.mergeable === 'CONFLICTING') {
		return;
	}

	const mergeabilityRow = selectHas('.branch-action-item:has(.merging-body)')!;
	if (mergeabilityRow) {
		// The PR is not a draft
		mergeabilityRow.prepend(

			<div
				className="branch-action-btn float-right js-immediate-updates js-needs-timeline-marker-header"
			>
				{createButton()}
			</div>,
		);
		return;
	}

	// The PR is still a draft
	mergeBar.before(createMergeabilityRow({
		className: 'rgh-update-pr-from-base-branch-row',
		action: createButton(),
		icon: <CheckIcon/>,
		iconClass: 'completeness-indicator-success',
		heading: 'This branch has no conflicts with the base branch',
		meta: 'Merging can be performed automatically.',
	}));
}

async function init(signal: AbortSignal): Promise<false | void> {
	await api.expectToken();

	delegate('.rgh-update-pr-from-base-branch', 'click', handler, {signal});
	observe('.merge-message', addButton, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRConversation,
	],
	exclude: [
		pageDetect.isClosedPR,
		() => $('.head-ref')!.title === 'This repository has been deleted',
	],
	awaitDomReady: true, // DOM-based exclusions
	init,
});

/*
Test URLs

PR without conflicts
https://github.com/refined-github/sandbox/pull/60

Draft PR without conflicts
https://github.com/refined-github/sandbox/pull/61

Native "Update branch" button
(pick a conflict-free PR from https://github.com/refined-github/refined-github/pulls?q=is%3Apr+is%3Aopen+sort%3Acreated-asc)

Native "Resolve conflicts" button
https://github.com/refined-github/sandbox/pull/9

Cross-repo PR with long branch names
https://github.com/refined-github/sandbox/pull/13

*/
