import './wait-for-checks.css';
import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import delegate from 'delegate-it';
import {InfoIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';
import pRetry, {AbortError} from 'p-retry';

import features from '.';
import observeElement from '../helpers/simplified-element-observer';
import * as prCiStatus from '../github-helpers/pr-ci-status';
import onPrMergePanelOpen from '../github-events/on-pr-merge-panel-open';
import {onPrMergePanelLoad} from '../github-events/on-fragment-load';

// Reuse the same checkbox to preserve its status
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
	return select('input[name="rgh-pr-check-waiter"]');
}

// Only show the checkbox if the last commit doesn't have a green or red CI icon
function showCheckboxIfNecessary(): void {
	const checkbox = getCheckbox();
	const lastCommitStatus = prCiStatus.getLastCommitStatus();

	const isNecessary = lastCommitStatus === prCiStatus.PENDING
		// If the latest commit is missing an icon, add the checkbox as long as there's at least one CI icon on the page (including `ci-link`)
		|| (lastCommitStatus === false && select.exists(prCiStatus.commitStatusIconSelector));

	if (!checkbox && isNecessary) {
		select('.js-merge-form .select-menu')?.append(generateCheckbox());
	} else if (checkbox && !isNecessary) {
		checkbox.parentElement!.remove();
	}
}

let waiting: symbol | undefined;

function disableForm(disabled = true): void {
	for (const field of select.all(`
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

async function handleMergeConfirmation(event: delegate.Event<Event, HTMLButtonElement>): Promise<void> {
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
	// Disable the feature if the PR requires administrator privileges https://github.com/refined-github/refined-github/issues/1771#issuecomment-1092415019
	if (select.exists('input.js-admin-merge-override[type="checkbox"]')) {
		return;
	}

	showCheckboxIfNecessary();
	watchForNewCommits();
}

function onBeforeunload(event: BeforeUnloadEvent): void {
	if (waiting) {
		event.returnValue = '';
	}
}

async function init(signal: AbortSignal): Promise<Deinit[]> {
	// Warn user if it's not yet submitted
	window.addEventListener('beforeunload', onBeforeunload, {signal});

	return [
		onPrMergePanelLoad(onPrMergePanelHandler),

		onPrMergePanelOpen(onPrMergePanelHandler),

		// One of the merge buttons has been clicked
		delegate(document, '.js-merge-commit-button:not(.rgh-merging)', 'click', handleMergeConfirmation),

		// Cancel wait when the user presses the Cancel button
		delegate(document, '.commit-form-actions button:not(.js-merge-commit-button)', 'click', () => {
			disableForm(false);
		}),

		() => {
			if (commitObserver) {
				commitObserver.disconnect();
			}
		},
	];
}

void features.add(import.meta.url, {
	asLongAs: [
		pageDetect.isOpenPR,
		// The repo has enabled Actions
		() => select.exists('#actions-tab'),
		// The user is a maintainer, so they can probably merge the PR
		() => select.exists('.discussion-sidebar-item .octicon-lock'),
	],
	include: [
		pageDetect.isPRConversation,
	],
	exclude: [
		pageDetect.isDraftPR,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
