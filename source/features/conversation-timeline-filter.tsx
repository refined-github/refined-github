import delay from 'delay';
import React from 'dom-chef';
import select from 'select-dom';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';
import {CheckIcon, GearIcon, XIcon} from '@primer/octicons-react';

import features from '.';

const levels = {
	showAll: ['Show all', ''],
	showOnlyComments: ['Show only comments', 'Hides commits and events'],
	showOnlyUnresolvedComments: ['Show unresolved comments', 'Also hides resolved reviews and hidden comments'],
	showOnlyUnresolvedReviews: ['Show only unresolved reviews', 'Also hides regular comments']
};

type Level = keyof typeof levels;

let currentSettings: Level = 'showAll';

const filterId = 'rgh-timeline-filters';

async function handleSelection(): Promise<void> {
	// The event is fired before the DOM is updated. Extensions can't access the event’s `detail` where the widget would normally specify which element was selected
	await delay(1);

	currentSettings = select(`#${filterId} [aria-checked="true"]`)!.dataset.value as Level;

	select(`#${filterId} .reason`)!.textContent =
		currentSettings === 'showAll' ? '' : levels[currentSettings][0];

	for (const element of select.all('.js-timeline-item')) {
		processTimelineItem(element);
	}
}

function createRadio(filterSettings: Level): JSX.Element {
	const [title, summary] = levels[filterSettings];
	return (
		<label
			className="select-menu-item d-flex"
			aria-checked={String(filterSettings === currentSettings)}
			role="menuitemradio"
			data-value={filterSettings}
			tabIndex={0}
		>
			<CheckIcon className="select-menu-item-icon octicon octicon-check" aria-hidden="true"/>
			<div className="select-menu-item-text">
				{title}
				<div className="text-normal description">{summary}</div>
			</div>
		</label>
	);
}

function addTimelineItemsFilter(position: Element): void {
	position.before(
		<div className="discussion-sidebar-item js-discussion-sidebar-item rgh-clean-sidebar" id={filterId}>
			<details className="details-reset details-overlay select-menu hx_rsm">
				<summary
					className="text-bold discussion-sidebar-heading discussion-sidebar-toggle hx_rsm-trigger"
					aria-haspopup="menu"
					data-hotkey="x"
					role="button"
				>
					<GearIcon/>
					Filters
				</summary>

				<details-menu
					className="select-menu-modal position-absolute right-0 hx_rsm-modal js-discussion-sidebar-menu"
					style={{zIndex: 99}}
					on-details-menu-select={handleSelection}
				>
					<div className="select-menu-header">
						<span className="select-menu-title">Temporarily hide content</span>
						<button
							className="hx_rsm-close-button btn-link close-button"
							type="button"
							data-toggle-for="reference-select-menu"
						>
							<XIcon aria-label="Close menu" role="img"/>
						</button>
					</div>
					<div className="hx_rsm-content" role="menu">
						{createRadio('showAll')}
						{createRadio('showOnlyComments')}
						{createRadio('showOnlyUnresolvedComments')}
						{pageDetect.isPRConversation() &&
							createRadio('showOnlyUnresolvedReviews')}
					</div>
				</details-menu>
			</details>

			<p className="reason text-small text-gray"/>
		</div>
	);
}

function processTimelineItem(item: HTMLElement): void {
	if (select.exists('.js-comment[id^=pullrequestreview]', item)) {
		// PR review thread
		processPR(item);
		return;
	}

	if (!select.exists('.js-comment-container', item)) {
		// Other events
		applyDisplay(item, 'showAll');
		return;
	}

	if (select.exists('.rgh-preview-hidden-comments', item)) {
		// Hidden comment
		applyDisplay(
			item,
			'showOnlyComments'
		);
		return;
	}

	// Regular comments
	applyDisplay(
		item,
		'showOnlyComments',
		'showOnlyUnresolvedComments'
	);
}

function processPR(item: HTMLElement): void {
	let hasVisibleElement = false;

	const threadContainerItems = select.all('.js-resolvable-timeline-thread-container', item);

	for (const threadContainer of threadContainerItems) {
		if (threadContainer.getAttribute('data-resolved') === 'true') {
			applyDisplay(threadContainer, 'showOnlyComments');
		} else if (
			select.exists('.inline-comment-form-container', threadContainer)
		) {
			applyDisplay(
				threadContainer,
				'showOnlyUnresolvedComments',
				'showOnlyUnresolvedReviews',
				'showOnlyComments'
			);
		} else {
			// There is 1 special case here when github shows you a comment that was added to previous comment thread but it does not show whether it is resolved or not resolved comment.
			// It's kinda tricky to know what to do with this so it is marked as normal comment for meantime.
			// We are just checking here if user is able to comment inside that timeline thread, if not then it means we have this special situation that was just described.
			applyDisplay(
				threadContainer,
				'showOnlyComments',
				'showOnlyUnresolvedComments'
			);
		}

		// We need to hide whole thread group if we have hidden all comments inside.
		hasVisibleElement = hasVisibleElement || !threadContainer.hidden;
	}

	item.hidden = !hasVisibleElement && (
		threadContainerItems.length > 0 ||
		currentSettings === 'showOnlyUnresolvedReviews'
	);
}

function applyDisplay(
	element: HTMLElement,
	...displaySettings: Level[]
): void {
	element.hidden =
		!displaySettings.includes(currentSettings) &&
		currentSettings !== 'showAll';
}

function init(): void {
	observe('#partial-users-participants', {
		add: addTimelineItemsFilter
	});
	observe('.js-timeline-item', {
		constructor: HTMLElement,
		add: processTimelineItem
	});
}

void features.add(__filebasename, {
	include: [
		pageDetect.isPRConversation,
		pageDetect.isIssue
	],
	init
});
