import './conversation-activity-filter.css';

import delegate from 'delegate-it';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import CheckIcon from 'octicons-plain-react/Check';
import EyeIcon from 'octicons-plain-react/Eye';
import EyeClosedIcon from 'octicons-plain-react/EyeClosed';
import TriangleDownIcon from 'octicons-plain-react/TriangleDown';
import {$, $$, $$optional, $closest, elementExists} from 'select-dom';

import features from '../feature-manager.js';
import getCommentAuthor from '../github-helpers/get-comment-author.js';
import {registerHotkey} from '../github-helpers/hotkey.js';
import delay from '../helpers/delay.js';
import {isSmallDevice, wrap} from '../helpers/dom-utils.js';
import onetime from '../helpers/onetime.js';
import observe from '../helpers/selector-observer.js';

const minorFixesIssuePages = [
	'https://github.com/refined-github/refined-github/issues/3686',
	'https://github.com/refined-github/refined-github/issues/6000',
	'https://github.com/refined-github/refined-github/issues/7000',
	'https://github.com/refined-github/refined-github/issues/7777',
	'https://github.com/refined-github/refined-github/issues/8000',
];

// Keys are used as CSS selectors
const states = {
	showAll: 'Show all activities',
	hideEvents: 'Hide events',
	hideAllNoise: 'Hide events, bots, collapsed comments',
} as const;

type State = keyof typeof states;

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

const menuClass = 'rgh-conversation-activity-filter-menu';
const menuItemClass = 'rgh-conversation-activity-filter-menu-item';
const hiddenClassName = 'rgh-conversation-activity-filtered-event';
const collapsedClassName = 'rgh-conversation-activity-collapsed-comment';
const botClassName = 'rgh-conversation-activity-bot-comment';
const timelineItem = [
	'.js-timeline-item',
	// React issue pages
	'[data-wrapper-timeline-id]:not([data-wrapper-timeline-id="load-top"])', // Exclude "Load more" button
];
const comment = ['.comment-body', '.react-issue-comment'];

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

	if (getCommentAuthor($(comment, item)).endsWith('[bot]')) {
		item.classList.add(botClassName);
	}
}

function processDissmissedReviewEvent(item: HTMLElement): void {
	item.classList.add(hiddenClassName);

	// Find and hide stale reviews referenced by dismissed review events
	for (const {hash: staleReviewId} of $$('.TimelineItem-body > a[href^="#pullrequestreview-"]', item)) {
		$closest(timelineItem, $(staleReviewId))
			.classList
			.add(collapsedClassName);
	}
}

function processReview(review: HTMLElement): void {
	const hasMainComment = elementExists('.js-comment[id^=pullrequestreview] .timeline-comment', review);

	// Don't combine the selectors or use early returns without understanding what a thread or thread comment is
	const unresolvedThreads = $$optional('.js-resolvable-timeline-thread-container[data-resolved="false"]', review);
	const unresolvedThreadComments = $$optional('.timeline-comment-group:not(.minimized-comment)', review);

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
	} else if (elementExists(comment, item)) {
		processSimpleComment(item);
	} else {
		processTimelineEvent(item);
	}
}

let currentState: State;

function applyState(targetState: State): void {
	const container = $([
		// Current PR view
		'[class^="prc-PageLayout-PageLayoutWrapper"]',
		// Current issue view
		'[class*="IssueViewer-module__mainContainer"]',
		// Old PR view - TODO: Drop after July 2026
		'.js-issues-results',
	]);
	container.setAttribute('data-rgh-conversation-activity-filter', targetState);

	// Sync menu items state between two widgets
	for (const menuItem of $$(`.${menuItemClass}`)) {
		if (menuItem.dataset.state === targetState) {
			menuItem.ariaChecked = 'true';
			menuItem.focus();
		} else {
			menuItem.ariaChecked = 'false';
		}
	}

	currentState = targetState;
	SessionPageSetting.set(targetState);
}

async function handleSelection({target}: Event): Promise<void> {
	// Extensions can't access the event’s `detail` where the widget would normally specify which element was selected
	const {state} = $('[aria-checked="true"]', target as HTMLElement).dataset;
	applyState(state as State);
}

function createMenuItems(): JSX.Element[] {
	return Object.entries(states).map(([itemState, label]) => (
		<li data-targets="action-list.items" role="none" className="ActionListItem">
			<button
				data-state={itemState}
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

async function addWidget(anchor: Element): Promise<void> {
	const position = $closest('div', anchor);
	if (position.classList.contains('rgh-conversation-activity-filter')) {
		return;
	}

	await delay(100); // Let `clean-conversation-headers` run first
	wrap(position, <div className="rgh-conversation-activity-filter-wrapper" />);
	position.classList.add('rgh-conversation-activity-filter');

	const baseId = crypto.randomUUID();

	const menu = (
		<action-menu
			className={`${menuClass} d-inline-block position-relative lh-condensed-ultra v-align-middle ${
				position.offsetWidth > 0 ? 'ml-2' : ''
			}`}
			data-select-variant="single"
		>
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
									{createMenuItems()}
								</ul>
							</action-list>
						</div>
						{!isSmallDevice() && (
							<div className="Overlay-footer Overlay-footer--divided py-2 tmp-py2">
								<span className="color-fg-muted">
									Press <kbd>h</kbd> to cycle through filters,
									<br />
									even when the dropdown is closed
								</span>
							</div>
						)}
					</div>
				</anchored-position>
			</focus-group>
		</action-menu>
	);

	position.after(menu);
}

function uncollapseTargetedComment(): void {
	if (location.hash.startsWith('#issuecomment-')) {
		$closest(timelineItem, $(`.${collapsedClassName} ${location.hash}`))
			.classList
			.remove(collapsedClassName);
	}
}

function switchToNextFilter(): void {
	const stateNames = Object.keys(states);
	const nextIndex = stateNames.indexOf(currentState) + 1;
	const nextState = stateNames.length > nextIndex ? stateNames[nextIndex] : stateNames[0];

	applyState(nextState as State);
}

async function init(signal: AbortSignal): Promise<void> {
	currentState = SessionPageSetting.get()
		?? (minorFixesIssuePages.some(url => location.href.startsWith(url))
			? 'hideAllNoise' // Automatically hide resolved comments on "Minor codebase updates and fixes" issue pages
			: 'showAll');

	const initialSetupOnce = onetime(() => {
		if (currentState !== 'showAll') {
			applyState(currentState);
		}

		registerHotkey('h', switchToNextFilter, {signal});
		delegate(`.${menuClass}`, 'itemActivated', handleSelection);
	});

	observe(
		[
			// Issue view
			'[class^="HeaderMetadata-module__metadataContent"]',
			'[class*="HeaderMetadata-module__smallMetadataRow"]',
			// PR view
			'[class*="PullRequestHeaderSummary-module"] > .d-flex',
			// Old PR view - TODO: Remove after July 2026
			'#partial-discussion-header .gh-header-meta > .flex-auto:last-child',
			'#partial-discussion-header .sticky-header-container .meta:last-child',
		],
		// This code runs twice - we have 2 widgets on the page
		async anchor => {
			await addWidget(anchor);
			initialSetupOnce();
		},
		{signal},
	);

	observe(timelineItem, processItem, {signal});
	globalThis.addEventListener('hashchange', uncollapseTargetedComment, {signal});
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
