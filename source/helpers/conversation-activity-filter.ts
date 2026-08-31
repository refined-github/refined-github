import elementReady from 'element-ready';
import {writable, get} from 'svelte/store';

export const states = {
	showAll: 'Show all activities',
	hideEvents: 'Hide events',
	hideAllNoise: 'Hide events, bots, collapsed comments',
} as const;

export type State = keyof typeof states;

const minorFixesIssuePages = [
	'https://github.com/refined-github/refined-github/issues/7000',
	'https://github.com/refined-github/refined-github/issues/8000',
];

function sessionKey(url: string): string {
	return `rgh-conversation-activity-filter-state:${new URL(url).pathname}`;
}

function getStateForUrl(url: string): State {
	const stored = sessionStorage.getItem(sessionKey(url));
	if (stored) {
		return stored as State;
	}

	return minorFixesIssuePages.some(page => url.startsWith(page))
		? 'hideAllNoise' // Automatically hide resolved comments on "Minor codebase updates and fixes" issue pages
		: 'showAll';
}

export const activityFilterState = writable<State>(getStateForUrl(location.href));

async function setActivityFilterAttribute(value: State): Promise<void> {
	const wrapper = await elementReady([
		// PR
		'[class^="prc-PageLayout-PageLayoutWrapper"]',
		// Issue
		'[class*="IssueViewer-module__mainContainer"]',
	], {
		stopOnDomReady: false,
		signal: AbortSignal.timeout(5000)
	});

	// Bail out if a newer subscription call has already updated the state
	if (value !== get(activityFilterState)) {
		return;
	}

	wrapper!.setAttribute('data-rgh-conversation-activity-filter', value);
}

// eslint-disable-next-line unicorn/no-top-level-side-effects
activityFilterState.subscribe(value => {
	sessionStorage.setItem(sessionKey(location.href), value);
	void setActivityFilterAttribute(value);
});

export function fetchStateForCurrentUrl(): void {
	activityFilterState.set(getStateForUrl(location.href));
}
