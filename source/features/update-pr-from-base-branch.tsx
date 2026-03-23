import React from 'dom-chef';
import {elementExists} from 'select-dom';
import {$, $optional} from 'select-dom/strict.js';
import * as pageDetect from 'github-url-detection';
import delegate, {type DelegateEvent} from 'delegate-it';
import {CachedFunction} from 'webext-storage-cache';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import api from '../github-helpers/api.js';
import {getBranches} from '../github-helpers/pr-branches.js';
import getPrInfo from '../github-helpers/get-pr-info.js';
import showToast from '../github-helpers/toast.js';
import {getConversationNumber, getRepo} from '../github-helpers/index.js';
import {expectToken} from '../github-helpers/github-token.js';
import {deletedHeadRepository, prMergeabilityBoxHeader} from '../github-helpers/selectors.js';

// TODO: Use CachedMap after https://github.com/fregante/webext-storage-cache/issues/51
const nativeRepos = new CachedFunction('native-update-button', {
	maxAge: {
		days: 10,
	},
	staleWhileRevalidate: {
		days: 1,
	},
	async updater(_nameWithOwner: string): Promise<boolean> {
		throw new TypeError('bad usage');
	},
});

async function disableFeatureOnRepo(): Promise<void> {
	const repo = getRepo()!.nameWithOwner;
	console.trace('Refined GitHub: Disabling `update-pr-from-base-branch` on', repo);
	features.unload(import.meta.url);
	await nativeRepos.applyOverride([repo], true);
}

async function mergeBranches(expectedHeadSha: string): Promise<AnyObject> {
	return api.v3uncached(`pulls/${getConversationNumber()!}/update-branch`, {
		method: 'PUT',
		// eslint-disable-next-line @typescript-eslint/naming-convention -- External API
		body: {expected_head_sha: expectedHeadSha},
		ignoreHTTPStatus: true, // eslint-disable-line @typescript-eslint/naming-convention -- Pre-existing
	});
}

async function handler({delegateTarget: button}: DelegateEvent<MouseEvent, HTMLButtonElement>): Promise<void> {
	button.disabled = true;
	await showToast(async () => {
		const {base} = getBranches();
		const {headRefOid} = await getPrInfo(base.relative);
		// Reads Error#message or GitHub's "message" response
		// eslint-disable-next-line @typescript-eslint/use-unknown-in-catch-callback-variable -- Just pass it along
		const response = await mergeBranches(headRefOid).catch(error => error);
		if (response instanceof Error || !response.ok) {
			throw new Error(`Error updating the branch: ${response.message as string}`, {cause: response});
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
			className="btn btn-sm rgh-update-pr-from-base-branch tooltipped tooltipped-w"
			aria-label="Use Refined GitHub to update the PR from the base branch"
		>
			Update branch
		</button>
	);
}

const nativeUpdateButtonSelector = '[aria-label="Conflicts"] [class^="MergeBoxSectionHeader-module__wrapper"] [data-component="buttonContent"]';

function canNativelyUpdate(): boolean {
	const nativeButton = $optional(nativeUpdateButtonSelector);
	return nativeButton?.textContent === 'Update branch';
}

async function canUpdateBranch(): Promise<boolean> {
	const {base} = getBranches();
	const prInfo = await getPrInfo(base.relative);
	const hasBranchAccess = ['ADMIN', 'WRITE'].includes(prInfo.headRepoPerm); // #8555

	return prInfo.needsUpdate
		&& prInfo.mergeable !== 'CONFLICTING'
		&& (
			prInfo.viewerCanUpdate
			|| prInfo.viewerCanEditFiles
			|| hasBranchAccess
		);
}

async function addButton(): Promise<void> {
	if (canNativelyUpdate()) {
		// Ideally the "canNativelyUpdate" observer is fired first and this listener isn't reached, but that is not guaranteed.
		await disableFeatureOnRepo();
		return;
	}

	if (!await canUpdateBranch()) {
		return;
	}

	const mergeabilityRow = $(
		'[aria-label="Conflicts"] [class^="MergeBoxSectionHeader-module__wrapper"]',
	);
	mergeabilityRow.prepend(createButton());
}

async function init(signal: AbortSignal): Promise<false | void> {
	await expectToken();
	if (await nativeRepos.getCached(getRepo()!.nameWithOwner)) {
		return false;
	}

	delegate('.rgh-update-pr-from-base-branch', 'click', handler, {signal});
	observe(prMergeabilityBoxHeader, addButton, {signal});
	observe(nativeUpdateButtonSelector, disableFeatureOnRepo, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRConversation,
	],
	exclude: [
		pageDetect.isClosedConversation,
		() => elementExists(deletedHeadRepository),
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

PRs to repos without write access, find one among your own PRs here:
https://github.com/pulls?q=is%3Apr+is%3Aopen+author%3A%40me+archived%3Afalse+-user%3A%40me

*/
