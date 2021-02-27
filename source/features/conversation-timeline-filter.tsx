import './conversation-timeline-filter.css';
import delay from 'delay';
import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import {observe} from 'selector-observer';
import {CheckIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '.';
import sidebarItem from '../github-widgets/conversation-sidebar-item';
import onNewComments from '../github-events/on-new-comments';
import {removeClassFromAll} from '../helpers/dom-utils';

const hiddenClassName = 'rgh-conversation-timeline-filtered';

const states = {
	default: '',
	showOnlyComments: 'Only show comments',
	showOnlyUnresolvedComments: 'Only show unresolved comments',
	showOnlyUnresolvedReviews: 'Only show unresolved reviews'
};

type State = keyof typeof states;

let currentSettings: State = 'default';

const filterId = 'rgh-timeline-filters';

async function handleSelection(): Promise<void> {
	// The event is fired before the DOM is updated. Extensions can't access the event’s `detail` where the widget would normally specify which element was selected
	await delay(1);

	currentSettings = select(`#${filterId} [aria-checked="true"]`)!.dataset.value as State;

	select(`#${filterId} .reason`)!.textContent = states[currentSettings];

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
			aria-checked={filterSettings === currentSettings ? 'true' : 'false'}
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
				createRadio('showOnlyUnresolvedComments'),
				pageDetect.isPRConversation() && createRadio('showOnlyUnresolvedReviews')
			]
		})
	);
}

function processPage(): void {
	if (currentSettings === 'default') {
		removeClassFromAll(hiddenClassName);
	} else {
		for (const element of select.all('.js-timeline-item')) {
			processTimelineItem(element);
		}
	}
}

function processTimelineItem(item: HTMLElement): void {
	// PR review thread
	if (select.exists('.js-comment[id^=pullrequestreview]', item)) {
		processReview(item);
		return;
	}

	// Non-comment event, always hide
	if (!select.exists('.js-comment-container', item)) {
		hide(item, true);
		return;
	}

	// The comment was "hidden", thefore it's considered resolved
	if (select.exists('.rgh-preview-hidden-comments', item)) {
		hideWhen(
			item,
			'showOnlyUnresolvedComments',
			'showOnlyUnresolvedReviews'
		);
		return;
	}

	// Regular, unhidden comments
	hideWhen(
		item,
		'showOnlyUnresolvedReviews'
	);
}

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

function processReview(review: HTMLElement): void {
	const shouldHideWholeReview =
		['showOnlyUnresolvedComments', 'showOnlyUnresolvedReviews'].includes(currentSettings) &&
		isWholeReviewEssentiallyResolved(review);

	hide(review, shouldHideWholeReview);

	if (shouldHideWholeReview) {
		return;
	}

	for (const threadContainer of select.all('.js-resolvable-timeline-thread-container[data-resolved="true"]', review)) {
		hideWhen(
			threadContainer,
			'showOnlyUnresolvedReviews'
		);
	}
}

function hide(event: HTMLElement, hide: boolean): void {
	event.classList.toggle(hiddenClassName, hide);
}

function hideWhen(event: HTMLElement, ...statesThatShouldHideIt: State[]): void {
	hide(event, statesThatShouldHideIt.includes(currentSettings));
}

function init(): void {
	observe('#partial-users-participants', {
		add: addToSidebar
	});
}

void features.add(__filebasename, {
	include: [
		pageDetect.isPRConversation,
		pageDetect.isIssue
	],
	init: onetime(init)
});
