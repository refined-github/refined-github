import './conversation-timeline-filter.css';
import React from 'dom-chef';
import select from 'select-dom';
import elementReady from 'element-ready';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import features from '.';
import delay from 'delay';
import onNewComments from '../github-events/on-new-comments';

enum FilterSettings
{
	ShowAll = 1,
	ShowOnlyComments = 2,
	ShowOnlyUnresolvedComments = 3,
	ShowOnlyUnresolvedReviews = 4
}

let CurrentSettings : FilterSettings = FilterSettings.ShowAll;
let autoLoadEnabled : boolean = false;

const showFilterId = "rgh-show-filter";
const autoLoadHiddenSelectorId = 'auto-load-hidden';


// Every element on the timeline that is recognizable by this feature will be marked with tis class.
const timelineElementClass = "rgh-is-timeline-element";
const timelineCommentClass = "rgh-is-timeline-comment";
const timelineFiltersSelectorId = 'timeline-filters';
const detailsSelector = `#${timelineFiltersSelectorId} details`;
const notiticationsSelector = '.discussion-sidebar-item.sidebar-notifications';
const timelineItemSelector = '.js-timeline-item';
const loadMoreSelector = '.ajax-pagination-btn:not([disabled])';
const discussionBucketSelector = "#discussion_bucket";

function regenerateFilterSummary(): void {
	const timelineFilter = select(`#${timelineFiltersSelectorId}`)!;

	let text = "";
	switch(CurrentSettings) {
		case FilterSettings.ShowAll:
			text = "Show All";
			break;
		case FilterSettings.ShowOnlyComments:
			text = "Show only comments";
			break;
		case FilterSettings.ShowOnlyUnresolvedReviews:
			text = "Show only unresolved reviews";
			break;
		case FilterSettings.ShowOnlyUnresolvedComments:
			text = "Show unresolved comments";
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
	// TODO: Rework this
	autoLoadEnabled = (select<HTMLInputElement>(`#${autoLoadHiddenSelectorId}`))!.checked;
	CurrentSettings = parseInt((select<HTMLInputElement>(`#${showFilterId}:checked`))!.value);


	// Close window
	select(detailsSelector)!.removeAttribute('open');

	regenerateFilterSummary();

	// TODO: put into method.
	const discussionBucket = select(discussionBucketSelector)!;
	const setFilter = (filterName : string) => discussionBucket.setAttribute("data-rgh-filter", filterName);
	switch(CurrentSettings)
	{
		case FilterSettings.ShowAll:
			setFilter("show-all");
			break;
		case FilterSettings.ShowOnlyComments:
			setFilter("show-only-comments");
			break;
		case FilterSettings.ShowOnlyUnresolvedReviews:
			setFilter("show-only-unresolved-reviews");
			break;
		case FilterSettings.ShowOnlyUnresolvedComments:
			setFilter("show-only-unresolved-comments");
			break;
	}

	if (autoLoadEnabled) {
		const loadMoreButton = select(loadMoreSelector);
		if (loadMoreButton) {
			await tryClickLoadMore(loadMoreButton);
		}
	}
}


function restoreSettings(): void {
	select.all<HTMLInputElement>(`#${showFilterId}`).forEach(el => el.checked = false);
	select<HTMLInputElement>(`#${showFilterId}[value="${CurrentSettings.valueOf()}"]`)!.checked = true;
	select<HTMLInputElement>(`#${autoLoadHiddenSelectorId}`)!.checked = autoLoadEnabled;
}

function createCheckbox(form: JSX.Element, id: string, title: string, summary: string, isSelected: boolean, hasTopBorder: boolean): void {
	const element = (
		<label className={'d-block p-3 ' + (hasTopBorder ? 'border-top' : '')}>
			<div className="form-checkbox my-0">
				<input id={id} type="checkbox" name="id" checked={isSelected}/> {title}
				<p className="note">
					{summary}
				</p>
			</div>
		</label>
	);

	form.append(element);
}

function createRadio(form: JSX.Element, id: string, title: string, summary: string, value: number, hasTopBorder: boolean): void {
	const element = (
		<label className={'d-block p-3 ' + (hasTopBorder ? 'border-top' : '')}>
			<div className="form-checkbox my-0">
				<input id={id} type="radio" name="id" value={value} checked={value===CurrentSettings}/> {title}
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
	summary.addEventListener("click", restoreSettings);
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
	// TODO : make this PR only.
	createRadio(form, showFilterId, 'Show only unresolved reviews', 'Also hides regular comments (PR only)', FilterSettings.ShowOnlyUnresolvedReviews, true);

	createCheckbox(form, autoLoadHiddenSelectorId, 'Load hidden', 'Automatically loads hidden timeline items.', autoLoadEnabled, true);

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

async function tryClickLoadMore(item: HTMLElement): Promise<any> {
	if (autoLoadEnabled) {
		// Just after loading page when user clicks that element he is redirected to some limbo. It happens because github javascript did not kick in yet.
		// To mitigate that we always give 1 second for javascript to load and notice this element so clicking it will be handled properly.
		await delay(1000);
		item.click();
	}
}

function processTimelineItem(item: HTMLElement): void {
	const pr = select('.js-comment[id^=pullrequestreview]', item);
	const normalComment = select('.js-comment-container', item);

	if (pr) {
		processPR(item);
	} else if (normalComment) {
		item.classList.add(timelineCommentClass, timelineElementClass)
	} else {
		item.classList.add("rgh-is-other", timelineElementClass)
	}
}

function processPR(item: HTMLElement): void {
	item.classList.add("rgh-is-timeline-elements-container");
	for (const threadContainer of select.all('.js-resolvable-timeline-thread-container', item)) {
		const commentContainer = select('.inline-comment-form-container', threadContainer);

		if (threadContainer.getAttribute('data-resolved') === 'true') {
			threadContainer.classList.add("rgh-is-resolved-comment", timelineCommentClass, timelineElementClass);
		} else if (commentContainer === null) {
			// There is 1 special case here when github shows you a comment that was added to previous comment thread but it does not show whether it is resolved or not resolved comment.
			// It's kinda tricky to know what to do with this so it is marked as normal comment for meantime.
			// We are just checking here if user is able to comment inside that timeline thread, if not then it means we have this special situation that was just described.
			threadContainer.classList.add(timelineCommentClass, timelineElementClass);
		} else {
			threadContainer.classList.add("rgh-is-unresolved-review-comment", timelineCommentClass, timelineElementClass);
		}
	}
}

function processAllTimelineItems()
{
	select
	.all(timelineItemSelector)
	.forEach(processTimelineItem);
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

	onNewComments(() => {
		processAllTimelineItems();
	});
	processAllTimelineItems();

	observe(loadMoreSelector, {
		async add(element) {
			await tryClickLoadMore(element as HTMLElement);
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
