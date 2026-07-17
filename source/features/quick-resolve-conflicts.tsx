import cx from 'clsx';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import CopilotIcon from 'octicons-plain-react/Copilot';
import {$, $$, $optional, elementExists} from 'select-dom';
import {setFieldText} from 'text-field-edit';

import features from '../feature-manager.js';
import {legacyCommentField} from '../github-helpers/selectors.js';
import withMenuOpen from '../github-helpers/with-menu-open.js';
import observe from '../helpers/selector-observer.js';
import {withTooltipRef} from '../helpers/tooltip.js';

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

				const className = cx('Button Button--medium Button--secondary', isCopilotItem && 'Button--iconOnly');
				const content = isCopilotItem
					? <CopilotIcon />
					: (
						<span className="Button-content">
							<span className="Button-label">
								Resolve conflicts
							</span>
						</span>
					);
				const ref = shouldHaveTooltip ? withTooltipRef(inactiveReason ?? 'Ask Copilot to resolve conflicts') : undefined;

				return <div>
					{isWebEditorItem && !isDisabled
						? (
							<a ref={ref} className={className} href={`${location.pathname}/conflicts`}>
								{content}
							</a>
						)
						: (
							<button
								ref={ref}
								className={className}
								type="button"
								disabled={isDisabled}
								onClick={isCopilotItem ? insertCopilotInstruction : undefined}
							>
								{content}
							</button>
						)}
				</div>;
			})}
		</div>
	);
}

async function replaceResolveConflictsDropdown(button: HTMLButtonElement): Promise<void> {
	if (button.textContent.trim() !== 'Resolve conflicts') {
		return;
	}

	const menuItems = await withMenuOpen(button, menu => $$('li[data-component="ActionList.Item"]', menu));
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
		pageDetect.isPRConversation,
	],
	init: initPrConversation,
});

/*

Test URLs:

- https://github.com/refined-github/sandbox/pull/82

*/
