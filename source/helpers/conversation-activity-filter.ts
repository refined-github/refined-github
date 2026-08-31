import {onAbort} from 'abort-utils';
import {writable} from 'svelte/store';

export const states = {
	showAll: 'Show all activities',
	hideEvents: 'Hide events',
	hideAllNoise: 'Hide events, bots, collapsed comments',
} as const;

export type State = keyof typeof states;

const defaults = new Map([
	['/refined-github/refined-github/issues/7000', 'hideAllNoise'],
	['/refined-github/refined-github/issues/8000', 'hideAllNoise'],
]);

function sessionKey(pathname: string): string {
	return `rgh-conversation-activity-filter-state:${pathname}`;
}

function getInitialStateForUrl(pathname: string): State {
	const initialState = sessionStorage.getItem(sessionKey(pathname))
		?? defaults.get(pathname)
		?? 'showAll';
	return initialState as State;
}

// Internal state used so that the state can be updated/reset on `init` without linking saving it to the storage
const {subscribe, set: internalSet} = writable<State>(
	getInitialStateForUrl(location.pathname),
);

export const activityFilterState = {
	subscribe,
	set(value: State): void {
		sessionStorage.setItem(sessionKey(location.pathname), value);
		internalSet(value);
	},
};

export function syncWrapper(
	wrapper: Element,
	{signal}: SignalAsOptions,
): void {
	const unsubscribe = activityFilterState.subscribe((value) => {
		wrapper.setAttribute('data-rgh-conversation-activity-filter', value);
	});
	onAbort(signal, unsubscribe);
}

export function fetchStateForCurrentUrl(): void {
	internalSet(getInitialStateForUrl(location.pathname));
}
