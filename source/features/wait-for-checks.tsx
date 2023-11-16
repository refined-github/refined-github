import './wait-for-checks.css';
import React from 'dom-chef';
import {$, $$, elementExists} from 'select-dom';
import onetime from 'onetime';
import {InfoIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';
import delegate, {DelegateEvent} from 'delegate-it';

import features from '../feature-manager.js';
import {userCanLikelyMergePR} from '../github-helpers/index.js';
import {isHasSelectorSupported} from '../helpers/select-has.js';
import {actionsTab} from '../github-helpers/selectors.js';
import observe from '../helpers/selector-observer.js';
import prCiStatus, {StatusState} from '../github-helpers/pr-ci-status.js';

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
async function showCheckboxIfNecessary(event: CustomEvent<StatusState>): Promise<void> {
	const checkbox = getCheckbox();
	const isNecessary = event.detail === 'PENDING';

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
	const mergeButton = event.delegateTarget;
	if (!getCheckbox()?.checked) {
		return;
	}

	event.preventDefault();
	disableForm();
	const currentConfirmation = Symbol('');
	waiting = currentConfirmation;

	prCiStatus.startPolling();
	const success = await new Promise(resolve => {
		prCiStatus.addEventListener('state-change', ((event: CustomEvent<StatusState>) => {
			resolve(event.detail === 'SUCCESS');
		}) as EventListener, {once: true});

		// New commits disable auto-merging
		prCiStatus.addEventListener('head-change', () => {
			resolve(false);
		}, {once: true});
	});

	disableForm(false);
	prCiStatus.stopPolling();
	if (!success || waiting !== currentConfirmation) {
		return;
	}

	mergeButton.classList.add('rgh-merging'); // Avoid triggering the event listener again
	mergeButton.click();
}

function onBeforeunload(event: BeforeUnloadEvent): void {
	if (waiting) {
		event.returnValue = '';
	}
}

function onPrMergePanelToggle(event: DelegateEvent): void {
	if (event.delegateTarget.matches('.open')) {
		prCiStatus.startPolling();
	} else {
		prCiStatus.stopPolling();
	}
}

function init(signal: AbortSignal): void {
	// Warn user if it's not yet submitted
	window.addEventListener('beforeunload', onBeforeunload, {signal});

	// Start/stop polling when the merge panel is toggled
	delegate('.js-merge-pr:not(.is-rebasing)', 'details:toggled', onPrMergePanelToggle, {signal});

	// Toggle checkbox visibility following state changes
	// Assertion due to https://github.com/microsoft/TypeScript/issues/28357
	prCiStatus.addEventListener('state-change', showCheckboxIfNecessary as unknown as EventListener, {signal});

	// TODO: Also use observer to track panel openings due to session:resume

	// One of the merge buttons has been clicked
	delegate('.js-merge-commit-button:not(.rgh-merging)', 'click', handleMergeConfirmation, {signal});

	// Cancel wait when the user presses the Cancel button
	delegate('.commit-form-actions button:not(.js-merge-commit-button)', 'click', () => {
		disableForm(false);
	}, {signal});

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
