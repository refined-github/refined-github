import {onAbort} from 'abort-utils';
import {writable} from 'svelte/store';

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

// eslint-disable-next-line unicorn/no-top-level-side-effects
activityFilterState.subscribe(value => {
	sessionStorage.setItem(sessionKey(location.href), value);
});

export function syncWrapper(wrapper: Element, {signal}: SignalAsOptions): void {
	const unsubscribe = activityFilterState.subscribe(value => {
		wrapper.setAttribute('data-rgh-conversation-activity-filter', value);
	});
	onAbort(signal, unsubscribe);
}

export function fetchStateForCurrentUrl(): void {
	activityFilterState.set(getStateForUrl(location.href));
}
