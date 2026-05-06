import delegate, {type DelegateEvent} from 'delegate-it';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {
	$, $closest, $optional, elementExists,
} from 'select-dom';
import {CachedFunction} from 'webext-storage-cache';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import getPrInfo from '../github-helpers/get-pr-info.js';
import {expectToken} from '../github-helpers/github-token.js';
import {getRepo} from '../github-helpers/index.js';
import {getBranches} from '../github-helpers/pr-branches.js';
import {deletedHeadRepository, prMergeabilityBoxHeader} from '../github-helpers/selectors.js';
import showToast from '../github-helpers/toast.js';
import {getIdentifiers} from '../helpers/feature-helpers.js';
import observe from '../helpers/selector-observer.js';
import updatePullRequestBranch from './update-pr-from-base-branch.gql';

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

const updateMethods = {
	// eslint-disable-next-line @typescript-eslint/naming-convention -- Uppercase to match GraphQL enum values
	MERGE: {
		buttonLabel: 'Update branch',
		tooltipLabel: 'Update branch with merge commit using Refined GitHub',
	},
	// eslint-disable-next-line @typescript-eslint/naming-convention -- Uppercase to match GraphQL enum values
	REBASE: {
		buttonLabel: 'Rebase',
		tooltipLabel: 'Update branch with rebase using Refined GitHub',
	},
};

/**
 * https://docs.github.com/en/graphql/reference/enums#pullrequestbranchupdatemethod
 */
type UpdateMethod = keyof typeof updateMethods;

/**
 * https://docs.github.com/en/graphql/reference/input-objects#updatepullrequestbranchinput
 */
type MergeBranchesOptions = {
	expectedHeadOid: string;
	pullRequestId: string;
	updateMethod: UpdateMethod;
};

async function mergeBranches(options: MergeBranchesOptions): Promise<AnyObject> {
	return api.v4uncached(updatePullRequestBranch, {
		variables: {
			input: {...options},
		},
	});
}

async function handler({delegateTarget: button}: DelegateEvent<MouseEvent, HTMLButtonElement>): Promise<void> {
	button.disabled = true;
	const {method} = button.dataset as {method: UpdateMethod};

	await showToast(async () => {
		const {base} = getBranches();
		const {id, headRefOid} = await getPrInfo(base.relative);
		const options = {
			expectedHeadOid: headRefOid,
			pullRequestId: id,
			updateMethod: method,
		};
		// eslint-disable-next-line @typescript-eslint/use-unknown-in-catch-callback-variable -- Just pass it along
		const response = await mergeBranches(options).catch(error => error);
		if (response instanceof Error) {
			throw new Error(`Error updating the branch: ${response.message}`, {cause: response});
		}
	}, {
		message: 'Updating branch…',
		doneMessage: 'Branch updated',
	});

	$closest('.ButtonGroup', button).remove();
}

const feature = getIdentifiers(import.meta.url);

function createButton(): JSX.Element {
	return (
		<div className="ButtonGroup">
			{Object.entries(updateMethods).map(([method, label]) => {
				const buttonId = crypto.randomUUID();
				const tooltipId = crypto.randomUUID();
				return (
					<div>
						<button
							id={buttonId}
							className={`Button--secondary Button--medium Button ${feature.class}`}
							data-method={method}
							aria-labelledby={tooltipId}
							type="button"
						>
							<span className="Button-content">
								<span className="Button-label">
									{label.buttonLabel}
								</span>
							</span>
						</button>
						<tool-tip
							id={tooltipId}
							className="sr-only position-absolute"
							for={buttonId}
							popover="manual"
							data-direction="s"
							data-type="label"
							aria-hidden="true"
							role="tooltip"
						>
							{label.tooltipLabel}
						</tool-tip>
					</div>
				);
			})}
		</div>
	);
}

const nativeUpdateButtonSelector
	= '[aria-label="Conflicts"] [class^="MergeBoxSectionHeader-module__wrapper"] [data-component="buttonContent"]';

function canNativelyUpdate(): boolean {
	const nativeButton = $optional(nativeUpdateButtonSelector);
	return nativeButton?.textContent === 'Update branch';
}

async function shouldShowButton(): Promise<boolean> {
	const {base} = getBranches();
	const prInfo = await getPrInfo(base.relative);

	const hasBranchAccess = ['ADMIN', 'WRITE'].includes(prInfo.headRepoPerm); // #8555
	const canUpdateBranch = prInfo.viewerCanUpdate || prInfo.viewerCanEditFiles || hasBranchAccess;

	return prInfo.needsUpdate && canUpdateBranch && prInfo.mergeable !== 'CONFLICTING';
}

async function addButton(): Promise<void> {
	if (canNativelyUpdate()) {
		// Ideally the "canNativelyUpdate" observer is fired first and this listener isn't reached, but that is not guaranteed.
		await disableFeatureOnRepo();
		return;
	}

	if (!await shouldShowButton()) {
		return;
	}

	const mergeabilityRow = $('[aria-label="Conflicts"] [class^="MergeBoxSectionHeader-module__contentLayout"]');
	mergeabilityRow.append(createButton());
}

async function init(signal: AbortSignal): Promise<false | void> {
	await expectToken();
	if (await nativeRepos.getCached(getRepo()!.nameWithOwner)) {
		return false;
	}

	delegate(feature.selector, 'click', handler, {signal});
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
