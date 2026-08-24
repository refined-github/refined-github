import {writable} from 'svelte/store';

export const states = {
	showAll: 'Show all activities',
	hideEvents: 'Hide events',
	hideAllNoise: 'Hide events, bots, collapsed comments',
} as const;

export type State = keyof typeof states;

const minorFixesIssuePages = [
	'https://github.com/refined-github/refined-github/issues/3686',
	'https://github.com/refined-github/refined-github/issues/6000',
	'https://github.com/refined-github/refined-github/issues/7000',
	'https://github.com/refined-github/refined-github/issues/7777',
	'https://github.com/refined-github/refined-github/issues/8000',
];

function sessionKey(): string {
	return `rgh-conversation-activity-filter-state:${location.pathname}`;
}

export const activityFilterState = writable<State>('showAll');

// eslint-disable-next-line unicorn/no-top-level-side-effects
activityFilterState.subscribe(value => {
	sessionStorage.setItem(sessionKey(), value);
});

export function resetActivityFilterState(): State {
	const state = (sessionStorage.getItem(sessionKey()) as State)
		?? (minorFixesIssuePages.some(url => location.href.startsWith(url))
			? 'hideAllNoise' // Automatically hide resolved comments on "Minor codebase updates and fixes" issue pages
			: 'showAll');
	activityFilterState.set(state);
	return state;
}
