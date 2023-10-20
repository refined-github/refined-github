import './wait-for-checks.css';
import React from 'dom-chef';
import {$, $$, elementExists} from 'select-dom';
import onetime from 'onetime';
import {InfoIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';
import pRetry, {AbortError} from 'p-retry';
import delegate, {DelegateEvent} from 'delegate-it';

import features from '../feature-manager.js';
import observeElement from '../helpers/simplified-element-observer.js';
import * as prCiStatus from '../github-helpers/pr-ci-status.js';
import onPrMergePanelOpen from '../github-events/on-pr-merge-panel-open.js';
import {onPrMergePanelLoad} from '../github-events/on-fragment-load.js';
import onAbort from '../helpers/abort-controller.js';
import {userCanLikelyMergePR} from '../github-helpers/index.js';
import {isHasSelectorSupported} from '../helpers/select-has.js';
import {actionsTab, prCommitStatusIcon} from '../github-helpers/selectors.js';
import observe from '../helpers/selector-observer.js';

// Reuse the same checkbox to preserve its state
const generateCheckbox = onetime(() => (
	<label className="v-align-text-top">
		<input checked type="checkbox" name="rgh-pr-check-waiter"/>
		{' Wait for successful checks '}
		<a
			className="tooltipped tooltipped-n ml-1"
			target="_blank"
			rel="noopener noreferrer"
			href="https://github.com/refined-github/refined-github/pull/975"
			aria-label="This only works if you keep this tab open in the background while waiting."
		>
			<InfoIcon/>
		</a>
	</label>
));

function getCheckbox(): HTMLInputElement | undefined {
	return $('input[name="rgh-pr-check-waiter"]');
}

// Only show the checkbox if the last commit doesn't have a green or red CI icon
function showCheckboxIfNecessary(): void {
	const checkbox = getCheckbox();
	const lastCommitStatus = prCiStatus.getLastCommitStatus();

	const isNecessary = lastCommitStatus === prCiStatus.PENDING
		// If the latest commit is missing an icon, add the checkbox as long as there's at least one CI icon on the page (including `ci-link`)
		|| (lastCommitStatus === false && elementExists(prCommitStatusIcon));

	if (!checkbox && isNecessary) {
		$('.js-merge-form .select-menu')?.append(generateCheckbox());
	} else if (checkbox && !isNecessary) {
		checkbox.parentElement!.remove();
	}
}

let waiting: symbol | undefined;

function disableForm(disabled = true): void {
	for (const field of $$(`
		textarea[name="commit_message"],
		input[name="commit_title"],
		input[name="rgh-pr-check-waiter"],
		button.js-merge-commit-button
	`)) {
		field.disabled = disabled;
	}

	// Enabled form = no waiting in progress
	if (!disabled) {
		waiting = undefined;
	}
}

async function handleMergeConfirmation(event: DelegateEvent<Event, HTMLButtonElement>): Promise<void> {
	if (!getCheckbox()?.checked) {
		return;
	}

	const lastCommitSha = prCiStatus.getLastCommitReference()?.trim();
	if (!lastCommitSha) {
		return;
	}

	event.preventDefault();
	disableForm();
	const currentConfirmation = Symbol('');
	waiting = currentConfirmation;

	let result: prCiStatus.CommitStatus;
	try {
		result = await pRetry(async () => {
			const status = await prCiStatus.getCommitStatus(lastCommitSha);

			// Ensure that it wasn't cancelled/changed in the meanwhile
			if (waiting !== currentConfirmation) {
				throw new AbortError('The merge was cancelled or a new commit was pushed');
			}

			if (status === prCiStatus.PENDING) {
				throw new Error('CI is not done yet');
			}

			return status;
		}, {
			forever: true,
			minTimeout: 5000,
			maxTimeout: 10_000,
		});
	} catch {
		return;
	} finally {
		disableForm(false);
	}

	if (result === prCiStatus.SUCCESS) {
		event.delegateTarget.classList.add('rgh-merging'); // Avoid triggering the event listener again
		event.delegateTarget.click();
	}
}

let commitObserver: undefined | MutationObserver;

function watchForNewCommits(): void {
	if (commitObserver) {
		return;
	}

	let previousCommit = prCiStatus.getLastCommitReference();
	const filteredListener = (): void => {
		const newCommit = prCiStatus.getLastCommitReference();
		if (newCommit === previousCommit) {
			return;
		}

		previousCommit = newCommit;
		// Cancel submission if a new commit was pushed
		disableForm(false);
		showCheckboxIfNecessary();
	};

	commitObserver = observeElement('.js-discussion', filteredListener, {
		childList: true,
		subtree: true,
	})!;
}

function onPrMergePanelHandler(): void {
	showCheckboxIfNecessary();
	watchForNewCommits();
}

function onBeforeunload(event: BeforeUnloadEvent): void {
	if (waiting) {
		event.returnValue = '';
	}
}

function init(signal: AbortSignal): void {
	// Warn user if it's not yet submitted
	window.addEventListener('beforeunload', onBeforeunload, {signal});

	onPrMergePanelLoad(onPrMergePanelHandler, signal);
	onPrMergePanelOpen(onPrMergePanelHandler, signal);

	// One of the merge buttons has been clicked
	delegate('.js-merge-commit-button:not(.rgh-merging)', 'click', handleMergeConfirmation, {signal});

	// Cancel wait when the user presses the Cancel button
	delegate('.commit-form-actions button:not(.js-merge-commit-button)', 'click', () => {
		disableForm(false);
	}, {signal});

	if (commitObserver) {
		onAbort(signal, commitObserver);
	}

	// Disable the feature under certain conditions.
	// These conditions cannot go in the `exclude` array because the mergeability box is loaded asynchronously
	observe([
		// If it has a native Merge Queue behavior
		'.js-auto-merge-box',

		// If the PR requires administrator privileges https://github.com/refined-github/refined-github/issues/1771#issuecomment-1092415019
		'input.js-admin-merge-override[type="checkbox"]',
	], () => {
		getCheckbox()?.remove();
		features.unload(import.meta.url);
	}, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		isHasSelectorSupported,
		userCanLikelyMergePR,
		pageDetect.isOpenPR,
		// The repo has enabled Actions
		() => elementExists(actionsTab),
	],
	include: [
		pageDetect.isPRConversation,
	],
	exclude: [
		pageDetect.isDraftPR,
	],
	awaitDomReady: true, // DOM-based inclusions
	init,
});

/*

Test URLs

Checks: https://github.com/refined-github/sandbox/pull/12
No Checks: https://github.com/refined-github/sandbox/pull/10

*/
