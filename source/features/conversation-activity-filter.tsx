import './conversation-activity-filter.css';

import React from 'dom-chef';
import {$, $optional} from 'select-dom/strict.js';
import {$$, elementExists} from 'select-dom';
import * as pageDetect from 'github-url-detection';
import CheckIcon from 'octicons-plain-react/Check';
import EyeClosedIcon from 'octicons-plain-react/EyeClosed';
import EyeIcon from 'octicons-plain-react/Eye';
import TriangleDownIcon from 'octicons-plain-react/TriangleDown';
import domLoaded from 'dom-loaded';
import delegate from 'delegate-it';

import delay from '../helpers/delay.js';
import {wrap} from '../helpers/dom-utils.js';
import features from '../feature-manager.js';
import {registerHotkey} from '../github-helpers/hotkey.js';
import observe from '../helpers/selector-observer.js';

const states = {
	showAll: 'Show all activities',
	hideEvents: 'Hide events',
	hideEventsAndCollapsedComments: 'Hide events and collapsed comments',
} as const;

type State = keyof typeof states;

const minorFixesIssuePages = [
	'https://github.com/refined-github/refined-github/issues/3686',
	'https://github.com/refined-github/refined-github/issues/6000',
	'https://github.com/refined-github/refined-github/issues/7000',
	'https://github.com/refined-github/refined-github/issues/7777',
];

const SessionPageSetting = {
	get key(): string {
		return `rgh-conversation-activity-filter-state:${location.pathname}`;
	},

	set(value: State): void {
		sessionStorage.setItem(this.key, value);
	},

	get(): State | undefined {
		return sessionStorage.getItem(this.key) as State | undefined;
	},
};

const menuItemClass = 'rgh-conversation-activity-filter-menu-item';
const hiddenClassName = 'rgh-conversation-activity-filtered-event';
const collapsedClassName = 'rgh-conversation-activity-collapsed-comment';
const timelineItem = [
	'.js-timeline-item',
	// React issue pages
	'[data-wrapper-timeline-id]:not([data-wrapper-timeline-id="load-top"])', // Exclude "Load more" button
];

function processTimelineEvent(item: HTMLElement): void {
	// Don't hide commits in PR conversation timelines #5581
	if (pageDetect.isPR() && elementExists('.TimelineItem-badge .octicon-git-commit', item)) {
		return;
	}

	item.classList.add(hiddenClassName);
}

function processSimpleComment(item: HTMLElement): void {
	// Hide comments marked as resolved/hidden
	if (elementExists('.octicon-unfold', item)) {
		item.classList.add(collapsedClassName);
	}
}

function processDissmissedReviewEvent(item: HTMLElement): void {
	item.classList.add(hiddenClassName);

	// Find and hide stale reviews referenced by dismissed review events
	for (const {hash: staleReviewId} of $$('.TimelineItem-body > a[href^="#pullrequestreview-"]', item)) {
		$(staleReviewId)
			.closest(timelineItem)!
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
	} else if (elementExists(['.comment-body', '.react-issue-comment'], item)) {
		processSimpleComment(item);
	} else {
		processTimelineEvent(item);
	}
}

async function handleSelection({target}: Event): Promise<void> {
	// Extensions can't access the event’s `detail` where the widget would normally specify which element was selected
	const {state} = $('[aria-checked="true"]', target as HTMLElement).dataset;
	applyState(state as State);
}

function applyState(targetState: State): void {
	const container = $([
		'#diff-comparison-viewer-container',
		'[data-testid="issue-viewer-container"]',
		// TODO: Remove after July 2026
		'.js-issues-results',
	]);
	container.setAttribute('data-rgh-conversation-activity-filter', targetState);

	// Sync menu items state between two widgets
	for (const menuItem of $$(`.${menuItemClass}`)) {
		menuItem.ariaChecked = `${menuItem.dataset.state === targetState}`;
	}

	SessionPageSetting.set(targetState);
}

function createMenuItems(currentState: State): JSX.Element[] {
	return Object.entries(states).map(([itemState, label]) => (
		<li data-targets="action-list.items" role="none" className="ActionListItem">
			<button data-state={itemState}
				id={`item-${crypto.randomUUID()}`}
				type="button"
				role="menuitemradio"
				className={'ActionListContent ' + menuItemClass}
				aria-checked={`${itemState === currentState}`}
			>
				<span className="ActionListItem-visual ActionListItem-action--leading">
					<CheckIcon className="ActionListItem-singleSelectCheckmark" />
				</span>
				<span className="ActionListItem-label">
					{label}
				</span>
			</button>
		</li>
	));
}

async function addWidget(state: State, anchor: HTMLElement): Promise<void> {
	const position = anchor.closest('div')!;
	if (position.classList.contains('rgh-conversation-activity-filter')) {
		return;
	}

	await delay(100); // Let `clean-conversation-headers` run first
	wrap(position, <div className="rgh-conversation-activity-filter-wrapper" />);
	position.classList.add('rgh-conversation-activity-filter');

	const baseId = crypto.randomUUID();

	const menu = (
		<action-menu
			className={`rgh-conversation-activity-filter-menu d-inline-block position-relative lh-condensed-ultra v-align-middle ${position.offsetWidth > 0 ? 'ml-2' : ''}`}
			data-select-variant="single">
			<focus-group direction="vertical" mnemonics retain>
				<button
					id={`${baseId}-button`}
					// @ts-expect-error HTML standard
					popovertarget={`${baseId}-overlay`}
					aria-controls={`${baseId}-list`}
					aria-haspopup="true"
					type="button"
					className="Button--small Button color-fg-muted p-0"
				>
					<span className="Button-content">
						<span className="Button-visual Button-leadingVisual">
							<EyeIcon />
							<EyeClosedIcon className="color-fg-danger" />
						</span>
						<span className="Button-label lh-condensed-ultra">
							<span className="rgh-conversation-events-label v-align-text-top color-fg-danger">events</span>
						</span>
						<span className="Button-visual Button-trailingVisual">
							<TriangleDownIcon />
						</span>
					</span>
				</button>
				<anchored-position
					id={`${baseId}-overlay`}
					data-target="action-menu.overlay"
					anchor={`${baseId}-button`}
					align="start"
					side="outside-bottom"
					anchor-offset="normal"
					popover="auto"
				>
					<div className="Overlay Overlay--size-small-portrait">
						<div className="Overlay-body Overlay-body--paddingNone">
							<action-list>
								<ul
									id={`${baseId}-list`}
									aria-labelledby={`${baseId}-button`}
									role="menu"
									className="ActionListWrap--inset ActionListWrap"
								>
									{createMenuItems(state)}
								</ul>
							</action-list>
						</div>
					</div>
				</anchored-position>
			</focus-group>
		</action-menu>
	);

	position.after(menu);
}

function uncollapseTargetedComment(): void {
	if (location.hash.startsWith('#issuecomment-')) {
		$optional(`.${collapsedClassName} ${location.hash}`)
			?.closest(timelineItem)
			?.classList
			.remove(collapsedClassName);
	}
}

function switchToNextFilter(): void {
	const currentState = $(`.${menuItemClass}[aria-checked="true"]`).dataset.state as State;

	const stateNames = Object.keys(states);
	const nextIndex = stateNames.indexOf(currentState) + 1;
	const nextState = stateNames.length > nextIndex ? stateNames.at(nextIndex) : stateNames.at(0);

	applyState(nextState as State);
}

async function init(signal: AbortSignal): Promise<void> {
	const initialState = SessionPageSetting.get()
		?? (minorFixesIssuePages.some(url => location.href.startsWith(url))
			? 'hideEventsAndCollapsedComments' // Automatically hide resolved comments on "Minor codebase updates and fixes" issue pages
			: 'showAll');

	observe([
		// Issue pages
		'[class^="HeaderMetadata-module__metadataContent"]',
		'[class*="HeaderMetadata-module__smallMetadataRow"]',
		// PR pages
		'span[class*="PullRequestHeaderSummary-module"] > .d-flex',
		// Old PR pages. TODO: Remove after July 2026
		'#partial-discussion-header .gh-header-meta > .flex-auto:last-child',
		'#partial-discussion-header .sticky-header-container .meta:last-child',
	], addWidget.bind(undefined, initialState), {signal});

	globalThis.addEventListener('hashchange', uncollapseTargetedComment, {signal});

	observe(timelineItem, processItem, {signal});

	delegate('.rgh-conversation-activity-filter-menu', 'itemActivated', handleSelection);

	if (initialState !== 'showAll') {
		// Wait for the DOM to be ready before applying the initial state
		// https://github.com/refined-github/refined-github/issues/7086
		await domLoaded;
		applyState(initialState);
	}

	registerHotkey('h', switchToNextFilter, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isConversation,
		// Workaround for #6554
		// TODO: remove once the issue is resolved
		pageDetect.isRepoIssueOrPRList,
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
