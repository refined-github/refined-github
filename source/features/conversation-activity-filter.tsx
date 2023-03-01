import './conversation-activity-filter.css';
import delay from 'delay';
import React from 'dom-chef';
import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import {CheckIcon, EyeClosedIcon, EyeIcon, XIcon} from '@primer/octicons-react';

import {wrap} from '../helpers/dom-utils';
import features from '../feature-manager';
import {registerHotkey} from '../github-helpers/hotkey';
import onConversationHeaderUpdate from '../github-events/on-conversation-header-update';
import observe from '../helpers/selector-observer';

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
	if (pageDetect.isPR() && select.exists('.TimelineItem-badge .octicon-git-commit', item)) {
		return;
	}

	item.classList.add(hiddenClassName);
}

function processSimpleComment(item: HTMLElement): void {
	// Hide comments marked as resolved/hidden
	if (select.exists('.minimized-comment > details', item)) {
		item.classList.add(collapsedClassName);
	}
}

function processDissmissedReviewEvent(item: HTMLElement): void {
	item.classList.add(hiddenClassName);

	// Find and hide stale reviews referenced by dismissed review events
	for (const {hash: staleReviewId} of select.all<HTMLAnchorElement>('.TimelineItem-body > [href^="#pullrequestreview-"]', item)) {
		select(staleReviewId)!
			.closest('.js-timeline-item')!
			.classList.add(collapsedClassName);
	}
}

function processReview(review: HTMLElement): void {
	const hasMainComment = select.exists('.js-comment[id^=pullrequestreview] .timeline-comment', review);

	// Don't combine the selectors or use early returns without understanding what a thread or thread comment is
	const unresolvedThreads = select.all('.js-resolvable-timeline-thread-container[data-resolved="false"]', review);
	const unresolvedThreadComments = select.all('.timeline-comment-group:not(.minimized-comment)', review);

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
	if (location.hash.startsWith('#issuecomment-') && select.exists(location.hash, item)) {
		return;
	}

	if (select.exists('.js-comment[id^=pullrequestreview]', item)) {
		processReview(item);
	} else if (select.exists('.TimelineItem-badge .octicon-x', item)) {
		processDissmissedReviewEvent(item);
	} else if (select.exists('.comment-body', item)) {
		processSimpleComment(item);
	} else {
		processTimelineEvent(item);
	}
}

async function handleSelection({target}: Event): Promise<void> {
	// The event is fired before the DOM is updated. Extensions can't access the event’s `detail` where the widget would normally specify which element was selected
	await delay(1);

	const state = select('[aria-checked="true"]', target as Element)!.dataset.value as State;
	applyState(state);
}

function applyState(state: State): void {
	const container = select('.js-issues-results')!;
	container.classList.toggle(
		'rgh-conversation-activity-is-filtered',
		state !== 'default',
	);
	container.classList.toggle(
		'rgh-conversation-activity-is-collapsed-filtered',
		state === 'hideEventsAndCollapsedComments',
	);

	// Update the state of the dropdowns
	for (const dropdownItem of select.all(`.${dropdownClass} [aria-checked="false"][data-value="${state}"]`)) {
		dropdownItem.setAttribute('aria-checked', 'true');
	}

	for (const dropdownItem of select.all(`.${dropdownClass} [aria-checked="true"]:not([data-value="${state}"])`)) {
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
			<CheckIcon className="SelectMenu-icon SelectMenu-icon--check"/>
			{label || 'Show all'}
		</div>
	));
}

async function addWidget(header: string, state: State): Promise<void> {
	const position = (await elementReady(header))!.closest('div')!;
	if (position.classList.contains('rgh-conversation-activity-filter')) {
		return;
	}

	// Try to place the dropdown to the left https://github.com/refined-github/refined-github/issues/5450#issuecomment-1068284635
	const availableSpaceToTheLeftOfTheDropdown
		= position.lastElementChild!.getBoundingClientRect().right
		- position.parentElement!.getBoundingClientRect().left;

	// It may be zero on the sticky header, but `clean-conversation-headers` doesn't apply there
	const alignment
		= availableSpaceToTheLeftOfTheDropdown === 0
		|| (availableSpaceToTheLeftOfTheDropdown > expectedDropdownWidth)
			? 'right-0' : 'left-0';

	wrap(position, <div className="rgh-conversation-activity-filter-wrapper"/>);
	position.classList.add('rgh-conversation-activity-filter');
	position.after(
		<details
			className={`details-reset details-overlay d-inline-block ml-2 position-relative ${dropdownClass}`}
			id="rgh-conversation-activity-filter-select-menu"
		>
			<summary>
				<EyeIcon className="color-fg-muted"/>
				<EyeClosedIcon className="color-fg-danger"/>
				<div className="dropdown-caret ml-1"/>
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
							<XIcon/>
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
	'https://github.com/refined-github/refined-github/issues/5222',
	'https://github.com/refined-github/refined-github/issues/3686',
	'https://github.com/refined-github/refined-github/issues/6000',
];

function uncollapseTargetedComment(): void {
	if (location.hash.startsWith('#issuecomment-')) {
		select(`.${collapsedClassName} ${location.hash}`)?.closest('.js-timeline-item')?.classList.remove(collapsedClassName);
	}
}

function switchToNextFilter(): void {
	const state = select(`.${dropdownClass} [aria-checked="true"]`)!.dataset.value as State;
	// eslint-disable-next-line default-case
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

async function init(signal: AbortSignal): Promise<Deinit> {
	const state = minorFixesIssuePages.some(url => location.href.startsWith(url))
		? 'hideEventsAndCollapsedComments' // Automatically hide resolved comments on "Minor codebase updates and fixes" issue pages
		: 'default';

	await addWidget('#partial-discussion-header .gh-header-meta :is(clipboard-copy, .flex-auto)', state);
	await addWidget('#partial-discussion-header .gh-header-sticky :is(clipboard-copy, relative-time)', state);

	if (state !== 'default') {
		applyState(state);
	}

	window.addEventListener('hashchange', uncollapseTargetedComment, {signal});

	observe('.js-timeline-item', processItem, {signal});

	return registerHotkey('h', switchToNextFilter);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isConversation,
	],
	additionalListeners: [
		onConversationHeaderUpdate,
	],
	shortcuts: {
		h: 'Cycle through conversation activity filters',
	},
	deduplicate: 'has-rgh-inner',
	init,
});
