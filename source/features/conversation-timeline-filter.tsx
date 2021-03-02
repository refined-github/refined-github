import './conversation-timeline-filter.css';
import delay from 'delay';
import React from 'dom-chef';
import select from 'select-dom';
import {CheckIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';
import SelectorObserver from 'selector-observer';

import features from '.';
import sidebarItem from '../github-widgets/conversation-sidebar-item';
import onNewComments from '../github-events/on-new-comments';
import {removeClassFromAll} from '../helpers/dom-utils';

const states = {
	default: '',
	showOnlyComments: 'Only show comments',
	showOnlyUnresolvedComments: 'Only show unresolved comments'
};

type State = keyof typeof states;

let currentSetting: State = 'default';
const filterId = 'rgh-timeline-filters';
const hiddenClassName = 'rgh-conversation-timeline-filtered';

const observer = new SelectorObserver(document.documentElement);

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
	if (currentSetting === 'showOnlyComments') {
		return;
	}

	// Hide comments marked as resolved/hidden
	if (select.exists('.minimized-comment:not(.d-none) > details', item)) {
		item.classList.add(hiddenClassName);
	}
}

function processReview(review: HTMLElement): void {
	if (currentSetting === 'showOnlyComments') {
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

async function handleSelection(): Promise<void> {
	// The event is fired before the DOM is updated. Extensions can't access the event’s `detail` where the widget would normally specify which element was selected
	await delay(1);

	currentSetting = select(`#${filterId} [aria-checked="true"]`)!.dataset.value as State;

	select(`#${filterId} .reason`)!.textContent = states[currentSetting];

	// `onNewComments` registers the selectors only once
	onNewComments(processPage);

	// Actually process it right now
	processPage();
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

function addToSidebar(position: Element): void {
	position.before(
		sidebarItem({
			id: filterId,
			name: 'Conversation view options',
			subHeader: 'Temporarily hide content',
			handleSelection,
			content: [
				createRadio('default'),
				createRadio('showOnlyComments'),
				createRadio('showOnlyUnresolvedComments')
			]
		})
	);
}

function init(): void {
	observer.observe('#partial-users-participants', {
		add: addToSidebar
	});
}

function deinit(): void {
	observer.disconnect();
}

void features.add(__filebasename, {
	include: [
		pageDetect.isConversation
	],
	init,
	deinit
});
