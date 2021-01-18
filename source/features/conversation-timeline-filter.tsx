import React from 'dom-chef';
import select from 'select-dom';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';
import {CheckIcon, GearIcon, XIcon} from '@primer/octicons-react';

import features from '.';

enum FilterSettings {
	ShowAll = 1,
	ShowOnlyComments = 2,
	ShowOnlyUnresolvedComments = 3,
	ShowOnlyUnresolvedReviews = 4
}

let currentSettings: FilterSettings = FilterSettings.ShowAll;

const showFilterName = 'rgh-show-filter';
const filterFormId = 'show-filter-form';

// Every element on the timeline that is recognizable by this feature will be marked with tis class.
const timelineFiltersSelectorId = 'timeline-filters';
const detailsSelector = `#${timelineFiltersSelectorId} details`;
const timelineItemSelector = '.js-timeline-item';

function regenerateFilterSummary(): void {
	const timelineFilter = select(`#${timelineFiltersSelectorId}`)!;

	let text = '';
	switch (currentSettings) {
		case FilterSettings.ShowAll:
			text = 'Show All';
			break;
		case FilterSettings.ShowOnlyComments:
			text = 'Show only comments';
			break;
		case FilterSettings.ShowOnlyUnresolvedReviews:
			text = 'Show only unresolved reviews';
			break;
		case FilterSettings.ShowOnlyUnresolvedComments:
			text = 'Show unresolved comments';
			break;
		default:
			text = '';
			break;
	}

	const newSummary = (
		<p className="reason text-small text-gray">
			{text}
		</p>
	);

	select('p.reason', timelineFilter)!.replaceWith(newSummary);
}

// @ts-expect-error TODO: adjust to new select menu
async function saveSettings(): Promise<any> {
	const formData = new FormData(select(`#${filterFormId}`));
	currentSettings = Number.parseInt(formData.get(showFilterName) as string, 10);

	// Close window
	select(detailsSelector)!.removeAttribute('open');

	regenerateFilterSummary();
	reapplySettings();
}

function reapplySettings(): void {
	select
		.all(timelineItemSelector)
		.forEach(element => {
			processTimelineItem(element);
		});
}

// @ts-expect-error TODO: adjust to new select menu
function restoreSettings(): void {
	select.all<HTMLInputElement>(`#${showFilterName}`).forEach(element => {
		element.checked = false;
	});
	select<HTMLInputElement>(`input[name=${showFilterName}][value="${currentSettings.valueOf()}"]`)!.checked = true;
}

function createRadio(title: string, summary: string, checked: boolean): JSX.Element {
	return (
		<label className="select-menu-item d-flex text-normal css-truncate" aria-checked={String(checked)} role="menuitemcheckbox" tabIndex={0}>
			<CheckIcon className="select-menu-item-icon" aria-hidden="true"/>
			<div className="select-menu-item-text">
				<strong>{title}</strong>
				<div className="description">{summary}</div>
			</div>
		</label>
	);
}

async function addTimelineItemsFilter(): Promise<void> {
	select('#partial-users-participants')!.before(
		<div className="discussion-sidebar-item js-discussion-sidebar-item">
			<details className="details-reset details-overlay select-menu hx_rsm">
				<summary className="text-bold discussion-sidebar-heading discussion-sidebar-toggle hx_rsm-trigger" aria-haspopup="menu" data-hotkey="x" role="button">
					<GearIcon/>
					Filters
				</summary>

				<details-menu className="select-menu-modal position-absolute right-0 hx_rsm-modal js-discussion-sidebar-menu" style={{zIndex: 99, overflow: 'visible'}} data-menu-max-options="10">
					<div className="select-menu-header">
						<span className="select-menu-title">Temporarily hide content</span>
						<button className="hx_rsm-close-button btn-link close-button" type="button" data-toggle-for="reference-select-menu">
							<XIcon aria-label="Close menu" role="img"/>
						</button>
					</div>
					<div className="hx_rsm-content" role="menu">
						{createRadio('Show all', '', true)}
						{createRadio('Show only comments', 'Hides commits and events', false)}
						{createRadio('Show only unresolved comments', 'Also hides resolved reviews and hidden comments', false)}
						{pageDetect.isPRConversation() && createRadio('Show only unresolved reviews', 'Also hides regular comments', false)}
					</div>
				</details-menu>
			</details>
		</div>
	);
}

function processTimelineItem(item: HTMLElement): void {
	const pr = select('.js-comment[id^=pullrequestreview]', item);
	const normalComment = select('.js-comment-container', item);

	if (pr) {
		processPR(item);
	} else if (normalComment) {
		applyDisplay(item, FilterSettings.ShowOnlyComments, FilterSettings.ShowOnlyUnresolvedComments);
	} else {
		applyDisplay(item, FilterSettings.ShowAll);
	}
}

function processPR(item: HTMLElement): void {
	let hasVisibleElement = false;

	for (const threadContainer of select.all('.js-resolvable-timeline-thread-container', item)) {
		const commentContainer = select('.inline-comment-form-container', threadContainer);

		if (threadContainer.getAttribute('data-resolved') === 'true') {
			applyDisplay(threadContainer, FilterSettings.ShowOnlyComments);
		} else if (commentContainer === null) {
			// There is 1 special case here when github shows you a comment that was added to previous comment thread but it does not show whether it is resolved or not resolved comment.
			// It's kinda tricky to know what to do with this so it is marked as normal comment for meantime.
			// We are just checking here if user is able to comment inside that timeline thread, if not then it means we have this special situation that was just described.
			applyDisplay(threadContainer, FilterSettings.ShowOnlyComments, FilterSettings.ShowOnlyUnresolvedComments);
		} else {
			applyDisplay(threadContainer, FilterSettings.ShowOnlyUnresolvedComments, FilterSettings.ShowOnlyUnresolvedReviews, FilterSettings.ShowOnlyComments);
		}

		// We need to hide whole thread group if we have hidden all comments inside.
		hasVisibleElement = hasVisibleElement || threadContainer.style.display === '';
	}

	if (hasVisibleElement) {
		item.style.display = '';
	} else {
		item.style.display = 'none';
	}
}

function applyDisplay(element: HTMLElement, ...displaySettings: FilterSettings[]): void {
	if (displaySettings.includes(currentSettings) || currentSettings === FilterSettings.ShowAll) {
		element.style.display = '';
	} else {
		element.style.display = 'none';
	}
}

async function init(): Promise<any> {
	await addTimelineItemsFilter();

	// There are some cases when github will remove this filter. In that case we need to add it again.
	// Example: Editing comment will make timeline filter to disappear.
	observe(`#${timelineFiltersSelectorId}`, {
		async remove() {
			await addTimelineItemsFilter();
		}
	});
	observe(timelineItemSelector, {
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
