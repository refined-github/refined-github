import React from 'dom-chef';
import select from 'select-dom';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';
import {CheckIcon, GearIcon, XIcon} from '@primer/octicons-react';

import features from '.';

const levels = {
	showAll: '',
	showOnlyComments: 'Show only comments',
	showOnlyUnresolvedComments: 'Show only unresolved reviews',
	showOnlyUnresolvedReviews: 'Show unresolved comments'
};

type Level = keyof typeof levels;

let currentSettings: Level = 'showAll';

const menuItemCheckbox = 'rgh-filter-menu-item-checkbox';

const timelineFiltersSelectorId = 'rgh-timeline-filters';

function regenerateFilterSummary(): void {
	select(`#${timelineFiltersSelectorId}`)!.textContent = levels[currentSettings];
}

async function saveSettings(filterSettings: Level, test: string): Promise<any> {
	currentSettings = filterSettings;
	regenerateFilterSummary();
	reapplySettings();

	for (const element of select.all(`.${menuItemCheckbox}`)) {
		element.hidden = true;
	}

	select(test)!.hidden = false;
}

function reapplySettings(): void {
	for (const element of select.all('.js-timeline-item')) {
		processTimelineItem(element);
	}
}

function createRadio(
	title: string,
	summary: string,
	filterSettings: Level
): JSX.Element {
	return (
		<label
			className="select-menu-item d-flex"
			aria-checked={String(filterSettings === currentSettings)}
			role="menuitemradio"
			tabIndex={0}
			onClick={async () => saveSettings(filterSettings, `#rgh-filter-menu-item-checkbox-${filterSettings}`)}
		>
			<CheckIcon
				id={`rgh-filter-menu-item-checkbox-${filterSettings}`}
				className={`${menuItemCheckbox} select-menu-item-icon octicon octicon-check`}
				aria-hidden="true"
			/>
			<div className="select-menu-item-text">
				{title}
				<div className="text-normal description">{summary}</div>
			</div>
		</label>
	);
}

async function addTimelineItemsFilter(): Promise<void> {
	select('#partial-users-participants')!.before(
		<div className="discussion-sidebar-item js-discussion-sidebar-item rgh-clean-sidebar">
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
						{createRadio(
							'Show all',
							'',
							'showAll'
						)}
						{createRadio(
							'Show only comments',
							'Hides commits and events',
							'showOnlyComments'
						)}
						{createRadio(
							'Show only unresolved comments',
							'Also hides resolved reviews and hidden comments',
							'showOnlyUnresolvedComments'
						)}
						{pageDetect.isPRConversation() &&
							createRadio(
								'Show only unresolved reviews',
								'Also hides regular comments',
								'showOnlyUnresolvedReviews'
							)}
					</div>
				</details-menu>
			</details>

			<p id={timelineFiltersSelectorId} className="reason text-small text-gray"/>
		</div>
	);
}

function processTimelineItem(item: HTMLElement): void {
	if (select.exists('.js-comment[id^=pullrequestreview]', item)) {
		// PR review thread
		processPR(item);
	} else if (select.exists('.js-comment-container', item)) {
		if (select.exists('.rgh-preview-hidden-comments', item)) {
			// Hidden comment
			applyDisplay(
				item,
				'showOnlyComments'
			);
		} else {
			// Regular comments
			applyDisplay(
				item,
				'showOnlyComments',
				'showOnlyUnresolvedComments'
			);
		}
	} else {
		// Other events
		applyDisplay(item, 'showAll');
	}
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

	item.hidden =
		(threadContainerItems.length > 0 ||
		currentSettings === 'showOnlyUnresolvedReviews') &&
		!hasVisibleElement;
}

function applyDisplay(
	element: HTMLElement,
	...displaySettings: Level[]
): void {
	if (
		displaySettings.includes(currentSettings) ||
		currentSettings === 'showAll'
	) {
		element.hidden = false;
	} else {
		element.hidden = true;
	}
}

async function init(): Promise<any> {
	// There are some cases when github will remove this filter. In that case we need to add it again.
	// Example: Editing comment will make timeline filter to disappear.
	observe('.discussion-sidebar-item.sidebar-notifications', {
		async add() {
			await addTimelineItemsFilter();
		}
	});
	observe('.js-timeline-item', {
		add(element) {
			const htmlElement = element as HTMLElement;
			processTimelineItem(htmlElement);
		}
	});
}

void features.add(__filebasename, {
	include: [
		pageDetect.isPRConversation,
		pageDetect.isIssue
	],
	init
});
