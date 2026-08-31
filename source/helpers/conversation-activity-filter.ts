import elementReady from 'element-ready';
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

function sessionKey(): string {
	return `rgh-conversation-activity-filter-state:${location.pathname}`;
}

function getDefaultState(): State {
	return minorFixesIssuePages.some(url => location.href.startsWith(url))
		? 'hideAllNoise' // Automatically hide resolved comments on "Minor codebase updates and fixes" issue pages
		: 'showAll';
}

export const activityFilterState = writable<State>('showAll');

let firstEmission = true;

// eslint-disable-next-line unicorn/no-top-level-side-effects
activityFilterState.subscribe(async value => {
	// Skip the emission `subscribe` fires immediately on registration, before resetActivityFilterState() has loaded the real value
	if (firstEmission) {
		firstEmission = false;
		return;
	}

	sessionStorage.setItem(sessionKey(), value);

	const wrapper = await elementReady([
		// PR
		'[class^="prc-PageLayout-PageLayoutWrapper"]',
		// Issue
		'[class*="IssueViewer-module__mainContainer"]',
	], {
		stopOnDomReady: false,
		signal: AbortSignal.timeout(5000)
	});

	wrapper!.setAttribute('data-rgh-conversation-activity-filter', value);
});

export function resetActivityFilterState(): State {
	const stored = sessionStorage.getItem(sessionKey());
	const state = stored as State ?? getDefaultState();
	activityFilterState.set(state);
	return state;
}
