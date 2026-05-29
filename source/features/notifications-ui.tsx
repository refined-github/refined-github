import './notifications-ui.css';
import React from 'dom-chef';
import {$, $$} from 'select-dom';
import * as pageDetect from 'github-url-detection';

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
					const [buttonLabel] = button.textContent.trim().split(' ');
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
	if (dropdown.classList.contains('manage-notifications-responsive')) {
		dropdown.classList.add('d-inline-block', 'width-auto');
	}
}

function init(): void {
	for (const dropdown of $$(['.notification-sort-by', '.notification-group-by'])) {
		replaceNotificationsDropdown(dropdown);
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isNotifications,
	],
	init,
	awaitDomReady: true,
});

/*

Test URLs:

- https://github.com/notifications

*/
