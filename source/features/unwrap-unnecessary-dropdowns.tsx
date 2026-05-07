import React from 'dom-chef';
import CopilotIcon from 'octicons-plain-react/Copilot';
import {$, $$} from 'select-dom';
import {setFieldText} from 'text-field-edit';
import * as pageDetect from 'github-url-detection';

import {legacyCommentField} from '../github-helpers/selectors.js';
import observe from '../helpers/selector-observer.js';
import features from '../feature-manager.js';

function replaceNotificationsDropdown(dropdown: Element): void {
	const label = $('.Button-label .color-fg-muted', dropdown).textContent.trim();
	const buttons = $$('button.ActionListContent', dropdown);

	const segmentedControl = (
		<segmented-control>
			<ul
				className="SegmentedControl--medium SegmentedControl"
				role="list"
				aria-label={label}
			>
				{buttons.map(button => {
					const buttonLabel = button.textContent.trim().split(' ')[0];
					const clonedForm = button.form!.cloneNode(true);
					$('button', clonedForm).replaceWith(
						<button
							className="Button--invisible Button--medium Button Button--invisible-noVisuals"
							type="submit"
						>
							<span className="Button-content">
								<span className="Button-label" data-content={buttonLabel}>
									{buttonLabel}
								</span>
							</span>
						</button>,
					);

					return (
						<li
							className={`SegmentedControl-item ${button.ariaChecked === 'true' ? 'SegmentedControl-item--selected' : ''}`}
							role="listitem"
							data-targets="segmented-control.items"
						>
							{clonedForm}
						</li>
					);
				})}
			</ul>
		</segmented-control>
	);

	dropdown.firstElementChild!.replaceWith(segmentedControl);
}

function init(signal: AbortSignal): void {
	observe(['.notification-sort-by', '.notification-group-by'], replaceNotificationsDropdown, {signal});
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
