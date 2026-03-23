import React from 'dom-chef';
import {elementExists} from 'select-dom';
import {$, $optional} from 'select-dom/strict.js';
import * as pageDetect from 'github-url-detection';
import delegate, {type DelegateEvent} from 'delegate-it';
import {CachedFunction} from 'webext-storage-cache';
import TriangleDownIcon from 'octicons-plain-react/TriangleDown';
import CheckIcon from 'octicons-plain-react/Check';

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

const updateMethods = {
	merge: {
		buttonLabel: 'Update branch',
		menuItemLabel: 'Update with merge commit',
	},
	rebase: {
		buttonLabel: 'Rebase branch',
		menuItemLabel: 'Update with rebase',
	},
};

type UpdateMethod = keyof typeof updateMethods;

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

let currentUpdateMethod: UpdateMethod = 'merge';

async function handleSelection({target}: Event): Promise<void> {
	// Extensions can't access the event’s `detail` where the widget would normally specify which element was selected
	const {method} = $('[aria-checked="true"]', target as HTMLElement).dataset;
	currentUpdateMethod = method as UpdateMethod;
	$(`.${updateButtonClass}`).textContent = updateMethods[currentUpdateMethod].buttonLabel;
}

function createMenuItems(): JSX.Element[] {
	return Object.entries(updateMethods).map(([method, label], index) => (
		<li data-targets="action-list.items" role="none" className="ActionListItem">
			<button data-method={method}
				id={`item-${crypto.randomUUID()}`}
				type="button"
				role="menuitemradio"
				className="ActionListContent"
				aria-checked={`${index === 0}`}
			>
				<span className="ActionListItem-visual ActionListItem-action--leading">
					<CheckIcon className="ActionListItem-singleSelectCheckmark" />
				</span>
				<span className="ActionListItem-label">
					{label.menuItemLabel}
				</span>
			</button>
		</li>
	));
}

const updateButtonClass = 'rgh-update-pr-from-base-branch';
const updateOptionsMenuClass = 'rgh-update-pr-from-base-branch-menu';

function createButton(): JSX.Element {
	const baseId = `action-menu-${crypto.randomUUID()}`;
	const updateButtonTooltipId = `tooltip-${crypto.randomUUID()}`;
	const optionsTooltipId = `tooltip-${crypto.randomUUID()}`;

	return (
		<div className='ButtonGroup'>
			<div>
				<button
					id="rgh-update-pr-from-base-branch-button"
					className={`Button--secondary Button--medium Button ${updateButtonClass}`}
					aria-labelledby={updateButtonTooltipId}
					type="button">
					<span className="Button-content">
						<span className="Button-label">
							{updateMethods.merge.buttonLabel}
						</span>
					</span>
				</button>
				<tool-tip
					id={updateButtonTooltipId}
					className="sr-only position-absolute"
					for="rgh-update-pr-from-base-branch-button"
					popover="manual"
					data-direction="s"
					data-type="label"
					aria-hidden="true"
					role="tooltip"
					style={{whiteSpace: 'no-wrap', maxWidth: 'none'}}
				>
					Use Refined GitHub to update this PR from the base branch
				</tool-tip>
			</div>
			<div>
				<action-menu className={updateOptionsMenuClass} data-select-variant="single">
					<focus-group direction="vertical" mnemonics retain>
						<button
							id={`${baseId}-button`}
							className="Button Button--iconOnly Button--secondary Button--medium"
							// @ts-expect-error HTML standard
							popovertarget={`${baseId}-overlay`}
							aria-controls={`${baseId}-list`}
							aria-haspopup="true"
							aria-labelledby={optionsTooltipId}
							type="button"
						>
							<TriangleDownIcon />
						</button>
						<tool-tip
							id={optionsTooltipId}
							className="sr-only position-absolute"
							for={`${baseId}-button`}
							popover="manual"
							data-direction="s"
							data-type="label"
							aria-hidden="true"
							role="tooltip"
						>
							Update branch options
						</tool-tip>
						<anchored-position
							id={`${baseId}-overlay`}
							data-target="action-menu.overlay"
							anchor={`${baseId}-button`}
							align="end"
							side="outside-bottom"
							anchor-offset="normal"
							popover="auto"
						>
							<div className="Overlay Overlay--size-auto">
								<div className="Overlay-body Overlay-body--paddingNone">
									<action-list>
										<ul
											id={`${baseId}-list`}
											className="ActionListWrap--inset ActionListWrap"
											aria-labelledby={`${baseId}-button`}
											role="menu"
										>
											{createMenuItems()}
										</ul>
									</action-list>
								</div>
							</div>
						</anchored-position>
					</focus-group>
				</action-menu>
			</div>
		</div>
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
	mergeabilityRow.append(createButton());
}

async function init(signal: AbortSignal): Promise<false | void> {
	await expectToken();
	if (await nativeRepos.getCached(getRepo()!.nameWithOwner)) {
		return false;
	}

	delegate(`.${updateButtonClass}`, 'click', handler, {signal});
	delegate(`.${updateOptionsMenuClass}`, 'itemActivated', handleSelection, {signal});
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
