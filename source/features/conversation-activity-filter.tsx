import './conversation-activity-filter.css';
import delay from 'delay';
import React from 'dom-chef';
import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import {CheckIcon, EyeClosedIcon, EyeIcon} from '@primer/octicons-react';

import {wrap} from '../helpers/dom-utils';
import features from '.';
import onNewComments from '../github-events/on-new-comments';
import {getRghIssueUrl} from '../helpers/rgh-issue-link';
import onConversationHeaderUpdate from '../github-events/on-conversation-header-update';

const states = {
	default: '',
	hideEvents: 'Hide events',
	hideEventsAndCollapsedComments: 'Hide events and collapsed comments',
};

type State = keyof typeof states;

const dropdownClass = 'rgh-conversation-activity-filter-dropdown';
const hiddenClassName = 'rgh-conversation-activity-filtered';
const collapsedClassName = 'rgh-conversation-activity-collapsed';

function isWholeReviewEssentiallyResolved(review: HTMLElement): boolean {
	const hasMainComment = select.exists('.js-comment[id^=pullrequestreview] .timeline-comment', review);
	if (hasMainComment) {
		return false;
	}

	// Don't combine the selectors or use early returns without understanding what a thread or thread comment is
	const hasUnresolvedThread = select.exists('.js-resolvable-timeline-thread-container[data-resolved="false"]', review);
	const hasUnresolvedThreadComment = select.exists('.timeline-comment-group:not(.minimized-comment)', review);
	return !hasUnresolvedThread || !hasUnresolvedThreadComment;
}

function processSimpleComment(item: HTMLElement): void {
	// Hide comments marked as resolved/hidden
	if (select.exists('.minimized-comment > details', item)) {
		item.classList.add(collapsedClassName);
	}
}

function processReview(review: HTMLElement): void {
	if (isWholeReviewEssentiallyResolved(review)) {
		review.classList.add(collapsedClassName);
		return;
	}

	for (const threadContainer of select.all('.js-resolvable-timeline-thread-container[data-resolved="true"]', review)) {
		threadContainer.classList.add(collapsedClassName);
	}
}

function processPage(): void {
	for (const item of select.all(`.js-timeline-item:not(.${hiddenClassName}, .${collapsedClassName})`)) {
		if (select.exists('.js-comment[id^=pullrequestreview]', item)) {
			processReview(item);
		} else if (select.exists('.comment-body', item)) {
			processSimpleComment(item);
		} else {
			// Non-comment event, always hide
			item.classList.add(hiddenClassName);
		}
	}
}

async function handleSelection({target}: Event): Promise<void> {
	// The event is fired before the DOM is updated. Extensions can't access the event’s `detail` where the widget would normally specify which element was selected
	await delay(1);

	const state = select('[aria-checked="true"]', target as Element)!.dataset.value as State;
	apply(state);
}

function apply(state: State): void {
	// `onNewComments` registers the selectors only once
	onNewComments(processPage);

	// Actually process it right now
	processPage();

	const container = select('.repository-content')!;
	container.classList.toggle(
		'rgh-conversation-activity-is-filtered',
		state !== 'default',
	);
	container.classList.toggle(
		'rgh-conversation-activity-is-collapsed-filtered',
		state === 'hideEventsAndCollapsedComments',
	);

	// Update the state of the other dropdown
	select(`.${dropdownClass} [aria-checked="false"][data-value="${state}"]`)!.setAttribute('aria-checked', 'true');
	select(`.${dropdownClass} [aria-checked="true"]:not([data-value="${state}"])`)!.setAttribute('aria-checked', 'false');
}

function createRadio(state: State, current: State): JSX.Element {
	const label = states[state];
	return (
		<div
			className="SelectMenu-item"
			role="menuitemradio"
			aria-checked={state === current ? 'true' : 'false'}
			data-value={state}
		>
			<CheckIcon className="SelectMenu-icon SelectMenu-icon--check"/>
			{label || 'Show all'}
		</div>
	);
}

async function addWidget(header: string, state: State): Promise<void> {
	const position = (await elementReady(header))!.closest('div')!;
	if (position.classList.contains('rgh-conversation-activity-filter')) {
		return;
	}

	wrap(position, <div className="rgh-conversation-activity-filter-wrapper"/>);
	position.classList.add('rgh-conversation-activity-filter');
	position.after(
		<details className={`details-reset details-overlay d-inline-block position-relative ${dropdownClass}`}>
			<summary className="ml-2">
				<EyeIcon className="color-text-secondary color-fg-muted"/>
				<EyeClosedIcon className="color-icon-danger color-fg-danger"/>
				<div className="dropdown-caret ml-1"/>
			</summary>
			<details-menu
				className="SelectMenu right-0"
				on-details-menu-select={handleSelection}
			>
				<div className="SelectMenu-modal">
					<div className="SelectMenu-header">
						<h3 className="SelectMenu-title color-fg-default">
							Filter Conversation Activities
						</h3>
					</div>
					<div className="SelectMenu-list">
						{createRadio('default', state)}
						{createRadio('hideEvents', state)}
						{createRadio('hideEventsAndCollapsedComments', state)}
					</div>
				</div>
			</details-menu>
		</details>,
	);
}

const minorFixesIssuePages = new Set([
	getRghIssueUrl(5222),
	getRghIssueUrl(4008),
]);

async function init(): Promise<void> {
	// Reset dropdowns state #4997
	const state = minorFixesIssuePages.has(location.href)
		? 'hideEventsAndCollapsedComments'
		: 'default';
	(await elementReady('.repository-content'))!.classList.remove(
		'rgh-conversation-activity-is-filtered',
		'rgh-conversation-activity-is-collapsed-filtered',
	);

	await addWidget('#partial-discussion-header .gh-header-meta :is(clipboard-copy, .flex-auto)', state);
	await addWidget('#partial-discussion-header .gh-header-sticky :is(clipboard-copy, relative-time)', state);

	// Automatically hide resolved comments on "Minor codebase updates and fixes" issue pages
	if (minorFixesIssuePages.has(location.href)) {
		apply(state);
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isConversation,
	],
	additionalListeners: [
		onConversationHeaderUpdate,
	],
	awaitDomReady: false,
	deduplicate: 'has-rgh-inner',
	init,
});
