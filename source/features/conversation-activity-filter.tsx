import './conversation-activity-filter.css';

import * as pageDetect from 'github-url-detection';
import {mount} from 'svelte';
import {$, $$, $$optional, closestElement, elementExists} from 'select-dom';

import features from '../feature-manager.js';
import getCommentAuthor from '../github-helpers/get-comment-author.js';
import {registerHotkey} from '../github-helpers/hotkey.js';
import {states, type State} from '../helpers/conversation-activity-filter.js';
import delay from '../helpers/delay.js';
import onetime from '../helpers/onetime.js';
import observe from '../helpers/selector-observer.js';
import ConversationActivityFilter from './conversation-activity-filter.svelte';

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

const hiddenClassName = 'rgh-conversation-activity-filtered-event';
const collapsedClassName = 'rgh-conversation-activity-collapsed-comment';
const botClassName = 'rgh-conversation-activity-bot-comment';
const minorFixesIssuePages = [
	'https://github.com/refined-github/refined-github/issues/3686',
	'https://github.com/refined-github/refined-github/issues/6000',
	'https://github.com/refined-github/refined-github/issues/7000',
	'https://github.com/refined-github/refined-github/issues/7777',
	'https://github.com/refined-github/refined-github/issues/8000',
];
const timelineItem = [
	'.js-timeline-item',
	// React issue pages
	'[data-wrapper-timeline-id]:not([data-wrapper-timeline-id="load-top"])', // Exclude "Load more" button
];
const comment = ['.comment-body', '.react-issue-comment'];
type ConversationActivityFilterWidget = {
	syncStateFromParent: (state: State) => void;
};
const widgets = new Set<ConversationActivityFilterWidget>();

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

function processDismissedReviewEvent(item: HTMLElement): void {
	item.classList.add(hiddenClassName);

	// Find and hide stale reviews referenced by dismissed review events
	for (const {hash: staleReviewId} of $$('.TimelineItem-body > a[href^="#pullrequestreview-"]', item)) {
		closestElement(timelineItem, $(staleReviewId))
			.classList
			.add(collapsedClassName);
	}
}

function processReview(review: HTMLElement): void {
	const hasMainComment = elementExists('.js-comment[id^=pullrequestreview] .timeline-comment', review);

	// Don't combine the selectors or use early returns without understanding what a thread or thread comment is
	// Resolved thread are handled by the CSS thanks to [data-resolved="true"]
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
		processDismissedReviewEvent(item);
	} else if (elementExists(comment, item)) {
		processSimpleComment(item);
	} else {
		processTimelineEvent(item);
	}
}

let currentState: State;

function applyState(targetState: State): void {
	const container = $([
		// PR
		'[class^="prc-PageLayout-PageLayoutWrapper"]',
		// Issue
		'[class*="IssueViewer-module__mainContainer"]',
		// Old PR view
		// TODO [2026-08-01]: Drop
		'.js-issues-results',
	]);
	container.setAttribute('data-rgh-conversation-activity-filter', targetState);

	// Sync menu items state between two widgets
	for (const widget of widgets) {
		widget.syncStateFromParent(targetState);
	}

	currentState = targetState;
	SessionPageSetting.set(targetState);
}

async function addWidget(anchor: Element): Promise<void> {
	const position = closestElement('div', anchor);
	if (position.classList.contains('rgh-conversation-activity-filter')) {
		return;
	}

	await delay(100); // Let `clean-conversation-headers` run first
	position.classList.add('rgh-conversation-activity-filter');
	const container = document.createElement('div');
	widgets.add(mount(ConversationActivityFilter, {
		target: container,
		props: {
			state: currentState,
			withMargin: position.offsetWidth > 0,
			onStateChange: applyState,
		},
	}));
	position.after(container.firstElementChild!);
}

function uncollapseTargetedComment(): void {
	if (location.hash.startsWith('#issuecomment-')) {
		closestElement(timelineItem, $(`.${collapsedClassName} ${location.hash}`))
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
	signal.addEventListener('abort', () => {
		widgets.clear();
	}, {once: true});

	currentState = SessionPageSetting.get()
		?? (minorFixesIssuePages.some(url => location.href.startsWith(url))
			? 'hideAllNoise' // Automatically hide resolved comments on "Minor codebase updates and fixes" issue pages
			: 'showAll');

	const initialSetupOnce = onetime(() => {
		if (currentState !== 'showAll') {
			applyState(currentState);
		}

		registerHotkey('h', switchToNextFilter, {signal});
	});

	observe(
		[
			// Issue view
			'[class^="HeaderMetadata-module__metadataContent"]',
			'[class*="HeaderMetadata-module__smallMetadataRow"]',
			// PR view
			'[class*="PullRequestHeaderSummary-module"] > .d-flex',
			// Old PR view
			// TODO [2026-08-01]: Remove
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
		// Workaround for https://github.com/refined-github/refined-github/issues/6554
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
