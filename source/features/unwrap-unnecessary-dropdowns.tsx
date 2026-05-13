import React from 'dom-chef';
import CopilotIcon from 'octicons-plain-react/Copilot';
import {
	$,
	$$,
	$$optional,
	$closest,
	$optional,
	elementExists,
} from 'select-dom';
import {setFieldText} from 'text-field-edit';
import * as pageDetect from 'github-url-detection';

import replaceElementTypeInPlace from '../helpers/recreate-element.js';
import {frame} from '../helpers/dom-utils.js';
import {legacyCommentField} from '../github-helpers/selectors.js';
import {tooltipped} from '../helpers/tooltip.js';
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

function createResolveConflictsButtons(menuItems: Element[]): JSX.Element {
	return (
		<div className="ButtonGroup">
			{menuItems.map(item => {
				const isCopilotItem = elementExists('.octicon-agent', item);
				const isWebEditorItem = elementExists('.octicon-pencil', item);
				if (!isCopilotItem && !isWebEditorItem) {
					throw new TypeError('Unknown dropdown item');
				}

				const inactiveWarning = $optional('[class*="InactiveWarning"]', item);
				// Doesn't exist if the item is enabled
				const inactiveReason = inactiveWarning?.textContent.trim();
				const isDisabled = Boolean(inactiveReason);
				const shouldHaveTooltip = isCopilotItem || isDisabled;

				let button: JSX.Element | HTMLAnchorElement
					= <button
						className={`Button Button--medium Button--secondary ${isCopilotItem ? 'Button--iconOnly' : ''}`}
						type="button"
						disabled={isDisabled}
						onClick={isCopilotItem ? insertCopilotInstruction : undefined}
					>
						{isCopilotItem
							? <CopilotIcon/>
							: (
								<span className="Button-content">
									<span className="Button-label">
										Resolve conflicts
									</span>
								</span>
							)}
					</button>;
				if (isWebEditorItem && !isDisabled) {
					button = replaceElementTypeInPlace(button, 'a');
					button.href = `${location.pathname}/conflicts`;
				}

				return <div>{
					shouldHaveTooltip
						? tooltipped(inactiveReason ?? 'Ask Copilot to resolve conflicts', button)
						: button
				}</div>;
			})}
		</div>
	);
}

async function replaceResolveConflictsDropdown(button: HTMLButtonElement): Promise<void> {
	if (button.textContent.trim() !== 'Resolve conflicts') {
		return;
	}

	button.click();
	// Wait for the menu DOM to be created, but not rendered
	await frame();
	const menuItems = $$('div[data-component="AnchoredOverlay"] li[data-component="ActionList.Item"]');
	button.click();

	const buttonGroup = createResolveConflictsButtons(menuItems);
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
