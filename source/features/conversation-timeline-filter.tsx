import React from 'dom-chef';
import select from 'select-dom';
import elementReady from 'element-ready';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';
import features from '.';

enum FilterSettings {
	ShowAll = 1,
	ShowOnlyComments = 2,
	ShowOnlyUnresolvedComments = 3,
	ShowOnlyUnresolvedReviews = 4
}

let currentSettings: FilterSettings = FilterSettings.ShowAll;
let autoLoadEnabled = false;

const showFilterId = 'rgh-show-filter';

// Every element on the timeline that is recognizable by this feature will be marked with tis class.
const timelineFiltersSelectorId = 'timeline-filters';
const detailsSelector = `#${timelineFiltersSelectorId} details`;
const notiticationsSelector = '.discussion-sidebar-item.sidebar-notifications';
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

async function saveSettings(): Promise<any> {
	currentSettings = Number.parseInt((select<HTMLInputElement>(`#${showFilterId}:checked`))!.value, 10);

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

function restoreSettings(): void {
	select.all<HTMLInputElement>(`#${showFilterId}`).forEach(element => {
		element.checked = false;
	});
	select<HTMLInputElement>(`#${showFilterId}[value="${currentSettings.valueOf()}"]`)!.checked = true;
}

function createRadio(form: JSX.Element, id: string, title: string, summary: string, value: number, hasTopBorder: boolean): void {
	const element = (
		<label className={'d-block p-3 ' + (hasTopBorder ? 'border-top' : '')}>
			<div className="form-checkbox my-0">
				<input id={id} type="radio" name="id" value={value} checked={value === currentSettings}/> {title}
				<p className="note">
					{summary}
				</p>
			</div>
		</label>
	);

	form.append(element);
}

async function addTimelineItemsFilter(): Promise<void> {
	const notifications = await elementReady(notiticationsSelector);
	if (!notifications) {
		return;
	}

	// Copy existing element and adapt its content
	const timelineFilter = notifications.cloneNode(true);
	timelineFilter.id = 'timeline-filters';

	select('form.thread-subscribe-form', timelineFilter)!.remove();
	const summary = select('summary', timelineFilter)!;
	summary.setAttribute('aria-label', 'Customize timeline filters');
	summary.addEventListener('click', restoreSettings);
	select('div.text-bold', summary)!.textContent = 'Filters';
	createDetailsDialog(timelineFilter);
	notifications.after(timelineFilter);

	regenerateFilterSummary();
}

function createDetailsDialog(timelineFilter: Element): void {
	const detailsDialog = select('details-dialog', timelineFilter)!;

	detailsDialog.setAttribute('src', '');

	detailsDialog.setAttribute('aria-label', 'Timeline filter settings');
	select('div.Box-header h3', detailsDialog)!.textContent = 'Timeline filter settings';
	const form = <div/>;

	createRadio(form, showFilterId, 'Show all', '', FilterSettings.ShowAll, true);
	createRadio(form, showFilterId, 'Show only comments', 'Hides commits and events', FilterSettings.ShowOnlyComments, true);
	createRadio(form, showFilterId, 'Show only unresolved comments', 'Also hides resolved reviews and hidden comments', FilterSettings.ShowOnlyUnresolvedComments, true);
	if (pageDetect.isPRConversation()) {
		createRadio(form, showFilterId, 'Show only unresolved reviews', 'Also hides regular comments (PR only)', FilterSettings.ShowOnlyUnresolvedReviews, true);
	}

	const actionButtons = (
		<div className="Box-footer form-actions">
			<button type="submit" className="btn btn-primary" data-disable-with="Saving…" onClick={async () => saveSettings()}>Save</button>
			<button type="reset" className="btn" data-close-dialog="">Cancel</button>
		</div>
	);

	form.append(actionButtons);

	// This works on github enterprise - form is already preloaded
	select('form', detailsDialog)?.remove();
	// This works on normal github. Normally form is loaded in place of `include-fragment` after we open details dialog.
	select('include-fragment', detailsDialog)?.remove();

	detailsDialog.append(form);
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
