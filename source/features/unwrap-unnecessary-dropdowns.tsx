import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {$, $$} from 'select-dom';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

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

void features.add(import.meta.url, {
	include: [
		pageDetect.isNotifications,
	],
	init,
});

/*

Test URLs:

- https://github.com/notifications

*/
