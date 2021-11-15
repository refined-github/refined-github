import './conversation-activity-filter.css';
import delay from 'delay';
import React from 'dom-chef';
import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import {CheckIcon, EyeClosedIcon, EyeIcon} from '@primer/octicons-react';

import features from '.';
import onNewComments from '../github-events/on-new-comments';
import {removeClassFromAll, wrap} from '../helpers/dom-utils';
import onConversationHeaderUpdate from '../github-events/on-conversation-header-update';

const states = {
	default: '',
	hideEvents: 'Hide events',
	hideEventsAndCollapsedComments: 'Hide events and collapsed comments',
};

type State = keyof typeof states;

let currentSetting: State = 'default';
const dropdownClass = 'rgh-conversation-activity-filter-dropdown';
const hiddenClassName = 'rgh-conversation-activity-filtered';

function isWholeReviewEssentiallyResolved(review: HTMLElement): boolean {
	const hasMainComment = select.exists('.js-comment[id^=pullrequestreview] .timeline-comment', review);
	if (hasMainComment) {
		return false;
	}

	// Don't combine the selectors or use early returns without understanding what a thread or thread comment is
	const hasUnresolvedThread = select.exists('div.js-resolvable-timeline-thread-container', review);
	const hasUnresolvedThreadComment = select.exists('.minimized-comment.d-none', review);
	return !hasUnresolvedThread || !hasUnresolvedThreadComment;
}

function processSimpleComment(item: HTMLElement): void {
	if (currentSetting === 'hideEvents') {
		return;
	}

	// Hide comments marked as resolved/hidden
	if (select.exists('.minimized-comment:not(.d-none) > details', item)) {
		item.classList.add(hiddenClassName);
	}
}

function processReview(review: HTMLElement): void {
	if (currentSetting === 'hideEvents') {
		return;
	}

	const shouldHideWholeReview = isWholeReviewEssentiallyResolved(review);
	if (shouldHideWholeReview) {
		review.classList.add(hiddenClassName);
		return;
	}

	for (const threadContainer of select.all('.js-resolvable-timeline-thread-container[data-resolved="true"]', review)) {
		threadContainer.classList.add(hiddenClassName);
	}
}

function processPage(): void {
	removeClassFromAll(hiddenClassName);

	if (currentSetting === 'default') {
		return;
	}

	for (const item of select.all('.js-timeline-item')) {
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

	currentSetting = select('[aria-checked="true"]', target as Element)!.dataset.value as State;

	// `onNewComments` registers the selectors only once
	onNewComments(processPage);

	// Actually process it right now
	processPage();

	select('.repository-content')!.classList.toggle(
		'rgh-conversation-activity-is-filtered',
		currentSetting !== 'default',
	);

	// Update the state of the other dropdown
	select(`.${dropdownClass} [aria-checked="false"][data-value="${currentSetting}"]`)!.setAttribute('aria-checked', 'true');
	select(`.${dropdownClass} [aria-checked="true"]:not([data-value="${currentSetting}"])`)!.setAttribute('aria-checked', 'false');
}

function createRadio(filterSettings: State): JSX.Element {
	const label = states[filterSettings];
	return (
		<div
			className="select-menu-item"
			role="menuitemradio"
			tabIndex={0}
			aria-checked={filterSettings === currentSetting ? 'true' : 'false'}
			data-value={filterSettings}
		>
			<CheckIcon className="select-menu-item-icon octicon octicon-check" aria-hidden="true"/>
			<div className="select-menu-item-text">{label || 'Show all'}</div>
		</div>
	);
}

async function addWidget(header: string): Promise<void> {
	const position = (await elementReady(header))!.closest('div')!;
	if (position.classList.contains('rgh-conversation-activity-filter')) {
		return;
	}

	wrap(position, <div className="d-flex flex-items-baseline"/>);
	position.classList.add('rgh-conversation-activity-filter');
	position.after(
		<details className={`details-reset details-overlay d-inline-block ml-2 position-relative ${dropdownClass}`}>
			<summary aria-haspopup="true">
				<EyeIcon className="color-text-secondary color-fg-muted"/>
				<EyeClosedIcon className="color-icon-danger color-fg-danger"/>
				<div className="dropdown-caret ml-1"/>
			</summary>
			<details-menu
				className="SelectMenu right-0"
				role="menu"
				on-details-menu-select={handleSelection}
			>
				<div className="SelectMenu-modal">
					<div className="SelectMenu-list">
						{createRadio('default')}
						{createRadio('hideEvents')}
						{createRadio('hideEventsAndCollapsedComments')}
					</div>
				</div>
			</details-menu>
		</details>,
	);
}

async function init(): Promise<void> {
	// Reset the dropdown state #4997
	currentSetting = 'default';
	select('.repository-content')!.classList.remove('rgh-conversation-activity-is-filtered');

	await addWidget('#partial-discussion-header .gh-header-meta :is(clipboard-copy, .flex-auto)');
	await addWidget('#partial-discussion-header .gh-header-sticky :is(clipboard-copy, relative-time)');
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
