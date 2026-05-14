import './update-pr-from-base-branch.css';

import delegate, {type DelegateEvent} from 'delegate-it';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {$, $$, $closest, $optional, elementExists} from 'select-dom';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import getPrInfo from '../github-helpers/get-pr-info.js';
import {expectToken} from '../github-helpers/github-token.js';
import {isArchivedRepoAsync} from '../github-helpers/index.js';
import {getBranches} from '../github-helpers/pr-branches.js';
import {deletedHeadRepository} from '../github-helpers/selectors.js';
import showToast from '../github-helpers/toast.js';
import {getIdentifiers} from '../helpers/feature-helpers.js';
import observe from '../helpers/selector-observer.js';
import {tooltipped} from '../helpers/tooltip.js';
import updatePullRequestBranch from './update-pr-from-base-branch.gql';

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

function createButtonGroup(): JSX.Element {
	return (
		<div className="ButtonGroup">
			{Object.entries(updateMethods).map(([method, label]) => (
				<div>
					{tooltipped(
						label.tooltipLabel,
						<button
							className={`Button--secondary Button--medium Button ${feature.class}`}
							data-method={method}
							type="button"
						>
							<span className="Button-content">
								<span className="Button-label">
									{label.buttonLabel}
								</span>
							</span>
						</button>,
					)}
				</div>
			))}
		</div>
	);
}

function setButtonsDisabledState(base: Element, disabled: boolean): void {
	for (const button of $$('button', base)) {
		button.disabled = disabled;
	}
}

async function isBranchUpdatable(): Promise<boolean> {
	const {base} = getBranches();
	const prInfo = await getPrInfo(base.relative);

	const hasBranchAccess = ['ADMIN', 'WRITE'].includes(prInfo.headRepoPerm); // #8555
	const canUpdateBranch = prInfo.viewerCanUpdate || prInfo.viewerCanEditFiles || hasBranchAccess;

	return prInfo.needsUpdate && canUpdateBranch && prInfo.mergeable !== 'CONFLICTING';
}

async function manageButtonGroup(stateIcon: Element): Promise<void> {
	const existingButtonGroup = $optional(`.ButtonGroup:has(.${feature.class})`);

	if (elementExists('.octicon-check', stateIcon)) {
		if (!await isBranchUpdatable()) {
			return;
		}

		if (existingButtonGroup) {
			setButtonsDisabledState(existingButtonGroup, false);
			return;
		}

		// The same container as the native button uses
		$('section[aria-label="Conflicts"] div[class^="MergeBoxSectionHeader-module__contentLayout"]')
			.append(createButtonGroup());

		return;
	}

	// Loading icon, GitHub is determining the mergeability status
	if (stateIcon.className.includes('Spinner')) {
		if (existingButtonGroup) {
			// Disable buttons until the status is determined
			setButtonsDisabledState(existingButtonGroup, true);
		}

		return;
	}

	if (elementExists('.octicon-alert-fill', stateIcon)) {
		// Button group won't exist if it wasn't previously added
		// For example, if a PR already had conflicts when its page was opened
		existingButtonGroup?.remove();
		return;
	}

	throw new TypeError('Unexpected state icon', {cause: stateIcon});
}

async function init(signal: AbortSignal): Promise<false | void> {
	await expectToken();

	delegate(feature.selector, 'click', handler, {signal});
	observe(
		'section[aria-label="Conflicts"] .flex-shrink-0 > :first-child',
		manageButtonGroup,
		{signal},
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRConversation,
	],
	exclude: [
		pageDetect.isMergedPR,
		() => elementExists(deletedHeadRepository),
		isArchivedRepoAsync,
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
