import './conversation-activity-filter.css';

import React from 'dom-chef';
import {$, $optional} from 'select-dom/strict.js';
import {$$, elementExists} from 'select-dom';
import * as pageDetect from 'github-url-detection';
import CheckIcon from 'octicons-plain-react/Check';
import EyeClosedIcon from 'octicons-plain-react/EyeClosed';
import EyeIcon from 'octicons-plain-react/Eye';
import XIcon from 'octicons-plain-react/X';
import domLoaded from 'dom-loaded';

import delay from '../helpers/delay.js';
import {wrap} from '../helpers/dom-utils.js';
import features from '../feature-manager.js';
import {registerHotkey} from '../github-helpers/hotkey.js';
import observe from '../helpers/selector-observer.js';

const expectedDropdownWidth = 270;

const states = {
	default: '',
	hideEvents: 'Hide events',
	hideEventsAndCollapsedComments: 'Hide events and collapsed comments',
};

type State = keyof typeof states;

const dropdownClass = 'rgh-conversation-activity-filter-dropdown';
const hiddenClassName = 'rgh-conversation-activity-filtered';
const collapsedClassName = 'rgh-conversation-activity-collapsed';

function processTimelineEvent(item: HTMLElement): void {
	// Don't hide commits in PR conversation timelines #5581
	if (pageDetect.isPR() && elementExists('.TimelineItem-badge .octicon-git-commit', item)) {
		return;
	}

	item.classList.add(hiddenClassName);
}

function processSimpleComment(item: HTMLElement): void {
	// Hide comments marked as resolved/hidden
	if (elementExists('.minimized-comment > details', item)) {
		item.classList.add(collapsedClassName);
	}
}

function processDissmissedReviewEvent(item: HTMLElement): void {
	item.classList.add(hiddenClassName);

	// Find and hide stale reviews referenced by dismissed review events
	for (const {hash: staleReviewId} of $$('.TimelineItem-body > a[href^="#pullrequestreview-"]', item)) {
		$(staleReviewId)
			.closest('.js-timeline-item')!
			.classList
			.add(collapsedClassName);
	}
}

function processReview(review: HTMLElement): void {
	const hasMainComment = elementExists('.js-comment[id^=pullrequestreview] .timeline-comment', review);

	// Don't combine the selectors or use early returns without understanding what a thread or thread comment is
	const unresolvedThreads = $$('.js-resolvable-timeline-thread-container[data-resolved="false"]', review);
	const unresolvedThreadComments = $$('.timeline-comment-group:not(.minimized-comment)', review);

	if (!hasMainComment && (unresolvedThreads.length === 0 || unresolvedThreadComments.length === 0)) {
		review.classList.add(collapsedClassName); // The whole review is essentially resolved
		return;
	}

	for (const thread of unresolvedThreads) {
		// Hide threads containing only resolved comments
		if (!unresolvedThreadComments.some(comment => thread.contains(comment))) {
			thread.classList.add(collapsedClassName);
		}
	}
}

function processItem(item: HTMLElement): void {
	// Exclude deep-linked comment
	if (location.hash.startsWith('#issuecomment-') && elementExists(location.hash, item)) {
		return;
	}

	if (elementExists('.js-comment[id^=pullrequestreview]', item)) {
		processReview(item);
	} else if (elementExists('.TimelineItem-badge .octicon-x', item)) {
		processDissmissedReviewEvent(item);
	} else if (elementExists('.comment-body', item)) {
		processSimpleComment(item);
	} else {
		processTimelineEvent(item);
	}
}

async function handleSelection({target}: Event): Promise<void> {
	// The event is fired before the DOM is updated. Extensions can't access the event’s `detail` where the widget would normally specify which element was selected
	await delay(1);

	const state = $('[aria-checked="true"]', target as Element).dataset.value as State;
	applyState(state);
}

function applyState(state: State): void {
	const container = $('.js-issues-results');
	container.setAttribute('data-rgh-conversation-activity-filter', state);
	container.classList.toggle(
		'rgh-conversation-activity-is-filtered',
		state !== 'default',
	);

	// Update the state of the dropdowns
	for (const dropdownItem of $$(`.${dropdownClass} [aria-checked="false"][data-value="${state}"]`)) {
		dropdownItem.setAttribute('aria-checked', 'true');
	}

	for (const dropdownItem of $$(`.${dropdownClass} [aria-checked="true"]:not([data-value="${state}"])`)) {
		dropdownItem.setAttribute('aria-checked', 'false');
	}
}

function createRadios(current: State): JSX.Element[] {
	return Object.entries(states).map(([state, label]) => (
		<div
			className="SelectMenu-item"
			role="menuitemradio"
			aria-checked={state === current ? 'true' : 'false'}
			data-value={state}
		>
			<CheckIcon className="SelectMenu-icon SelectMenu-icon--check" />
			{label || 'Show all'}
		</div>
	));
}

async function addWidget(state: State, anchor: HTMLElement): Promise<void> {
	const position = anchor.closest('div')!;
	if (position.classList.contains('rgh-conversation-activity-filter')) {
		return;
	}

	// TODO: Use `<anchored-position>` instead
	// Try to place the dropdown to the left https://github.com/refined-github/refined-github/issues/5450#issuecomment-1068284635
	await delay(100); // Let `clean-conversation-headers` run first
	const availableSpaceToTheLeftOfTheDropdown
		= position.lastElementChild!.getBoundingClientRect().right
			- position.parentElement!.getBoundingClientRect().left;

	const alignment
		= availableSpaceToTheLeftOfTheDropdown === 0
			|| (availableSpaceToTheLeftOfTheDropdown > expectedDropdownWidth)
			? 'right-0'
			: 'left-0';

	wrap(position, <div className="rgh-conversation-activity-filter-wrapper" />);
	position.classList.add('rgh-conversation-activity-filter');
	position.after(
		<details
			className={`details-reset details-overlay d-inline-block ml-2 position-relative ${dropdownClass}`}
			id="rgh-conversation-activity-filter-select-menu"
		>
			<summary className="height-full color-fg-muted">
				<EyeIcon />
				<EyeClosedIcon className="color-fg-danger" />
				<span className="text-small color-fg-danger v-align-text-bottom rgh-conversation-events-label ml-1">events</span>
				<div className="dropdown-caret ml-1" />
			</summary>
			<details-menu
				className={`SelectMenu ${alignment}`}
				on-details-menu-select={handleSelection}
			>
				<div className="SelectMenu-modal">
					<div className="SelectMenu-header">
						<h3 className="SelectMenu-title color-fg-default">
							Filter conversation activities
						</h3>
						<button
							className="SelectMenu-closeButton"
							type="button"
							data-toggle-for="rgh-conversation-activity-filter-select-menu"
						>
							<XIcon />
						</button>
					</div>
					<div className="SelectMenu-list">
						{createRadios(state)}
					</div>
				</div>
			</details-menu>
		</details>,
	);
}

const minorFixesIssuePages = [
	'https://github.com/refined-github/refined-github/issues/3686',
	'https://github.com/refined-github/refined-github/issues/6000',
	'https://github.com/refined-github/refined-github/issues/7000',
	'https://github.com/refined-github/refined-github/issues/7777',
];

function uncollapseTargetedComment(): void {
	if (location.hash.startsWith('#issuecomment-')) {
		$optional(`.${collapsedClassName} ${location.hash}`)
			?.closest('.js-timeline-item')
			?.classList
			.remove(collapsedClassName);
	}
}

function switchToNextFilter(): void {
	const state = $(`.${dropdownClass} [aria-checked="true"]`).dataset.value as State;

	switch (state) {
		case 'default': {
			applyState('hideEvents');
			break;
		}

		case 'hideEvents': {
			applyState('hideEventsAndCollapsedComments');
			break;
		}

		case 'hideEventsAndCollapsedComments': {
			applyState('default');
			break;
		}
	}
}

async function init(signal: AbortSignal): Promise<void> {
	const initialState = minorFixesIssuePages.some(url => location.href.startsWith(url))
		? 'hideEventsAndCollapsedComments' // Automatically hide resolved comments on "Minor codebase updates and fixes" issue pages
		: 'default';

	observe([
		'#partial-discussion-header .gh-header-meta > .flex-auto:last-child',
		'#partial-discussion-header .gh-header-sticky .sticky-content .meta:last-child',
	], addWidget.bind(undefined, initialState), {signal});

	if (initialState !== 'default') {
		// Wait for the DOM to be ready before applying the initial state
		// https://github.com/refined-github/refined-github/issues/7086
		await domLoaded;
		applyState(initialState);
	}

	globalThis.addEventListener('hashchange', uncollapseTargetedComment, {signal});

	observe('.js-timeline-item', processItem, {signal});

	registerHotkey('h', switchToNextFilter, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isConversation,
	],
	shortcuts: {
		h: 'Cycle through conversation activity filters',
	},
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github/pull/4030
https://github.com/refined-github/refined-github/issues/4008

*/
