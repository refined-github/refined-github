import React from 'dom-chef';
import CopilotIcon from 'octicons-plain-react/Copilot';
import {$, $$optional, $closest} from 'select-dom';
import {setFieldText} from 'text-field-edit';
import * as pageDetect from 'github-url-detection';

import {legacyCommentField} from '../github-helpers/selectors.js';
import observe from '../helpers/selector-observer.js';
import features from '../feature-manager.js';

// Replace dropdown while keeping its sizing/positioning classes
function replaceDropdownInPlace(dropdown: Element, form: Element): void {
	dropdown.replaceWith(form);
	form.classList.add(...dropdown.classList);
	form.classList.remove('dropdown', 'details-reset', 'details-overlay');
}

function replaceNotificationsDropdown(): void {
	const forms = $$optional('[action="/notifications/beta/update_view_preference"]');

	if (forms.length === 0) {
		return;
	}

	if (forms.length > 2) {
		throw new Error('GitHub added new view types. This feature is obsolete.');
	}

	const dropdown = $closest('action-menu', forms[0]);
	const currentView = $('.Button-label span:last-child', dropdown).textContent.trim();
	const desiredForm = currentView === 'Date' ? forms[0] : forms[1];

	// Replace dropdown
	replaceDropdownInPlace(dropdown, desiredForm);

	// Fix button's style
	const button = $('[type="submit"]', desiredForm);
	button.className = 'btn';
	button.textContent = `Group by ${button.textContent.toLowerCase()}`;
}

function initNotifications(signal: AbortSignal): void {
	observe('.js-check-all-container > :first-child', replaceNotificationsDropdown, {signal});
}

function insertCopilotInstruction(): void {
	const textarea = $(legacyCommentField);
	setFieldText(textarea, '@copilot resolve the merge conflicts in this pull request');
}

function createButtonGroup(): JSX.Element {
	const agentButtonId = crypto.randomUUID();
	const agentTooltipId = crypto.randomUUID();

	return (
		<div className="ButtonGroup">
			<div>
				<a
					className="Button--secondary Button--medium Button"
					href={`${location.pathname}/conflicts`}
					type="button"
				>
					<span className="Button-content">
						<span className="Button-label">
							Resolve conflicts
						</span>
					</span>
				</a>
			</div>
			<div>
				<button
					id={agentButtonId}
					className="Button--iconOnly Button--secondary Button--medium Button"
					aria-labelledby={agentTooltipId}
					type="button"
					onClick={insertCopilotInstruction}
				>
					<CopilotIcon/>
				</button>
				<tool-tip
					id={agentTooltipId}
					className="sr-only position-absolute"
					for={agentButtonId}
					popover="manual"
					data-direction="s"
					data-type="label"
					aria-hidden="true"
					role="tooltip"
				>
					Ask Copilot to resolve conflicts
				</tool-tip>
			</div>
		</div>
	);
}

function replaceResolveConflictsDropdown(button: HTMLButtonElement): void {
	if (button.textContent.trim() !== 'Resolve conflicts') {
		return;
	}

	const buttonGroup = createButtonGroup();
	button.replaceWith(buttonGroup);
}

function initPrConversation(signal: AbortSignal): void {
	observe(
		'[aria-label="Conflicts"] [class^="MergeBoxSectionHeader-module__wrapper"] button[data-component="Button"]',
		replaceResolveConflictsDropdown,
		{signal},
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isNotifications,
	],
	init: initNotifications,
}, {
	include: [
		pageDetect.isPRConversation,
	],
	init: initPrConversation,
});

/*

Test URLs:

- https://github.com/notifications
- https://github.com/refined-github/sandbox/pull/82

*/
