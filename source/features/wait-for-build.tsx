import './wait-for-build.css';
import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import delegate from 'delegate-it';
import {InfoIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as prCiStatus from '../github-helpers/pr-ci-status';
import onPrMergePanelOpen from '../github-events/on-pr-merge-panel-open';

let waiting: symbol | undefined;

// Reuse the same checkbox to preserve its status
const generateCheckbox = onetime(() => (
	<label className="d-inline-block">
		<input checked type="checkbox" name="rgh-pr-check-waiter"/>
		{' Wait for successful checks '}
		<a className="discussion-item-help tooltipped tooltipped-n" target="_blank" rel="noopener noreferrer" href="https://github.com/sindresorhus/refined-github/pull/975" aria-label="This only works if you keep this tab open while waiting.">
			<InfoIcon/>
		</a>
	</label>
));

function getCheckbox(): HTMLInputElement | undefined {
	return select('input[name="rgh-pr-check-waiter"]');
}

// Only show the checkbox if there's a pending commit
function showCheckboxIfNecessary(): void {
	const checkbox = getCheckbox();
	const isNecessary = prCiStatus.get() === prCiStatus.PENDING;
	if (!checkbox && isNecessary) {
		const container = select('.commit-form-actions .select-menu');
		if (container) {
			container.append(generateCheckbox());
		}
	} else if (checkbox && !isNecessary) {
		checkbox.parentElement!.remove();
	}
}

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
	const checkbox = getCheckbox();
	if (checkbox?.checked) {
		event.preventDefault();

		disableForm();
		const currentConfirmation = Symbol('');
		waiting = currentConfirmation;
		const status = await prCiStatus.wait();

		// Ensure that it wasn't cancelled/changed in the meanwhile
		if (waiting === currentConfirmation) {
			disableForm(false);

			if (status === prCiStatus.SUCCESS) {
				event.delegateTarget.click();
			}
		}
	}
}

function init(): void {
	// Watch for new commits and their statuses
	prCiStatus.addEventListener(showCheckboxIfNecessary);

	onPrMergePanelOpen(showCheckboxIfNecessary);

	// One of the merge buttons has been clicked
	delegate(document, '.js-merge-commit-button', 'click', handleMergeConfirmation);

	// Cancel wait when the user presses the Cancel button
	delegate(document, '.commit-form-actions button:not(.js-merge-commit-button)', 'click', () => {
		disableForm(false);
	});

	// Warn user if it's not yet submitted.
	// Sadly the message isn't shown
	window.addEventListener('beforeunload', event => {
		if (waiting) {
			event.returnValue = 'The PR hasn’t merged yet.';
		}
	});
}

void features.add(__filebasename, {
	include: [
		pageDetect.isPRConversation
	],
	exclude: [
		// The user cannot merge
		() => !select.exists('[data-details-container=".js-merge-pr"]:not(:disabled)')
	],
	init
});
