import './notifications-ui.css';

import React from 'dom-chef';
import {$, $$} from 'select-dom';
import FilterIcon from 'octicons-plain-react/Filter';
import GearIcon from 'octicons-plain-react/Gear';
import * as pageDetect from 'github-url-detection';

import {wrapAll} from '../helpers/dom-utils.js';
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

function moveAndCompactSettingsButton(button: Element): void {
	const {parentElement} = button;

	$('.Button-label', button).replaceWith(
		<span className="Button-visual">
			<GearIcon />
		</span>,
	);
	$('.Button-trailingAction', button).remove();

	$('#dialog-show-notifications-tabs-nav').after(button);
	button.classList.add('tmp-ml-1');
	parentElement!.classList.add('tmp-mb-0');
}

function moveReadUnreadButtons(buttonGroup: Element): void {
	buttonGroup.classList.add('tmp-mb-0', 'flex-shrink-0');
	buttonGroup.classList.remove('col-12');

	const queryBuilder = buttonGroup.nextElementSibling!;
	queryBuilder.classList.add('tmp-mb-0');

	wrapAll(<div className="d-flex flex-items-center tmp-mb-2 gap-1" />, buttonGroup, queryBuilder);
}

function replaceFiltersIcon(button: Element): void {
	const icon = $('.octicon-gear', button);
	icon.replaceWith(<FilterIcon />);
	// Remove extra margin - `gap` provides enough spacing
	button.classList.remove('ml-1');
}

function init(): void {
	// There are two UIs in the DOM: one for desktop and one for mobile
	for (const dropdown of $$(['.notification-sort-by', '.notification-group-by'])) {
		replaceNotificationsDropdown(dropdown);
	}

	moveAndCompactSettingsButton($('.manage-notifications-responsive > .manage-notifications-menu'));
	moveReadUnreadButtons($('.BtnGroup.col-12:has(> form[action$="set_preferred_inbox_query"])'));
	replaceFiltersIcon($('.Button[aria-label="Customize filters"]'));
}

void features.addCssFeature(import.meta.url);

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
