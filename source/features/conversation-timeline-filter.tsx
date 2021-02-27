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

const levels = {
	default: '',
	showOnlyComments: 'Only show comments',
	showOnlyUnresolvedComments: 'Only show unresolved comments',
	showOnlyUnresolvedReviews: 'Only show unresolved reviews'
};

type Level = keyof typeof levels;

let currentSettings: Level = 'default';

const filterId = 'rgh-timeline-filters';

async function handleSelection(): Promise<void> {
	// The event is fired before the DOM is updated. Extensions can't access the event’s `detail` where the widget would normally specify which element was selected
	await delay(1);

	currentSettings = select(`#${filterId} [aria-checked="true"]`)!.dataset.value as Level;

	select(`#${filterId} .reason`)!.textContent = levels[currentSettings];

	process();
	onNewComments(process);
}

function createRadio(filterSettings: Level): JSX.Element {
	const label = levels[filterSettings];
	return (
		<label
			className="select-menu-item"
			role="menuitemradio"
			tabIndex={0}
			aria-checked={String(filterSettings === currentSettings)}
			data-value={filterSettings}
		>
			<CheckIcon className="select-menu-item-icon octicon octicon-check" aria-hidden="true"/>
			<div className="select-menu-item-text">{label || 'Show all'}</div>
		</label>
	);
}

function addFilter(position: Element): void {
	position.before(
		sidebarItem({
			id: filterId,
			name: 'View options',
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

function process(): void {
	if (currentSettings === 'default') {
		removeClassFromAll(hiddenClassName);
	} else {
		for (const element of select.all('.js-timeline-item')) {
			processTimelineItem(element);
		}
	}
}

function processTimelineItem(item: HTMLElement): void {
	if (select.exists('.js-comment[id^=pullrequestreview]', item)) {
		// PR review thread
		processPR(item);
		return;
	}

	if (!select.exists('.js-comment-container', item)) {
		// Non-comment event, always hide
		hideUnlessOnState(item);
		return;
	}

	if (select.exists('.rgh-preview-hidden-comments', item)) {
		// The comment was "hidden", thefore it's considered resolved
		hideUnlessOnState(
			item,
			'showOnlyComments'
		);
		return;
	}

	// Regular comments
	hideUnlessOnState(
		item,
		'showOnlyComments',
		'showOnlyUnresolvedComments'
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

function processPR(review: HTMLElement): void {
	const isWholeReviewHidden =
		currentSettings === 'showOnlyUnresolvedReviews' &&
		isWholeReviewEssentiallyResolved(review);

	review.classList.toggle(hiddenClassName, isWholeReviewHidden);

	if (isWholeReviewHidden) {
		return;
	}

	for (const threadContainer of select.all('.js-resolvable-timeline-thread-container[data-resolved="true"]', review)) {
		hideUnlessOnState(threadContainer, 'showOnlyComments');
	}
}

function hideUnlessOnState(element: HTMLElement, ...showOnStates: Level[]): boolean {
	return element.classList.toggle(hiddenClassName, !showOnStates.includes(currentSettings));
}

function init(): void {
	observe('#partial-users-participants', {
		add: addFilter
	});
}

void features.add(__filebasename, {
	include: [
		pageDetect.isPRConversation,
		pageDetect.isIssue
	],
	init: onetime(init)
});
