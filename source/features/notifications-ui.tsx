import './notifications-ui.css';
import cx from 'clsx';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import SortAscIcon from 'octicons-plain-react/SortAsc';
import SortDescIcon from 'octicons-plain-react/SortDesc';
import {$, $$} from 'select-dom';

import features from '../feature-manager.js';
import {upperCaseFirst} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';

function transform(button: HTMLButtonElement): JSX.Element {
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
			className={cx('SegmentedControl-item', button.ariaChecked === 'true' && 'SegmentedControl-item--selected')}
			role="listitem"
			data-targets="segmented-control.items"
		>
			{clonedForm}
		</li>
	);
}

function replaceDropdown(dropdown: Element): void {
	const label = $('.Button-label .color-fg-muted', dropdown).textContent.trim();
	const buttons = $$('button.ActionListContent', dropdown);
	dropdown.classList.add('width-full', 'width-auto');
	dropdown.replaceChildren(
		<segmented-control>
			<ul
				className="SegmentedControl--medium SegmentedControl"
				role="list"
				aria-label={label}
			>
				{buttons.map(button => transform(button))}
			</ul>
		</segmented-control>,
	);
}

function compactDropdown(dropdown: Element): void {
	dropdown.classList.replace('width-full', 'width-auto');
	dropdown.classList.replace('ml-0', 'ml-auto');
	const label = $('.Button-content', dropdown);
	if (label.textContent.includes('Newest to')) {
		label.replaceChildren(<SortDescIcon />);
	} else {
		label.classList.add('rgh-display-contents');
		label.replaceChildren(
			<span className='fgColor-severe'>Oldest first</span>,
			<SortAscIcon className='fgColor-severe' />,
		);
	}
}

function markForm(status: 'read' | 'unread'): JSX.Element {
	const form = $(`form[data-status="${status}"]`);
	form.id ||= `rgh-mark-${status}-form`;
	const icon = $('.mr-1:has(svg)', form).cloneNode(true);
	return (
		<button
			className='d-flex justify-content-center align-items-center btn btn-sm mr-2'
			form={form.id}
			type="submit"
		>
			{icon}
			{/* Spaces collapsed, use mr-1 to space words */}
			<span className="not-sm-sr-only sr-only mr-1">Mark as</span>
			{upperCaseFirst(status)}
		</button>
	);
}

function unwrapActions(details: HTMLDetailsElement): void {
	details.before(markForm('read'), markForm('unread'));
	details.hidden = true;
}

function init(signal: AbortSignal): void {
	observe('.notification-group-by', replaceDropdown, {signal});
	observe('.notification-sort-by', compactDropdown, {signal});
	observe('.js-notifications-mark-selected-actions details.dropdown', unwrapActions, {signal});
}

void features.addCssFeature(import.meta.url);
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
