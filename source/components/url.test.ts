import {get} from 'svelte/store';
import {beforeEach, expect, it, vi} from 'vitest';

const initialUrl = 'https://github.com/refined-github/refined-github?tab=readme#intro';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function loadModule() {
	vi.resetModules();
	return import('./url.js');
}

beforeEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
	history.replaceState(history.state, '', initialUrl);
});

it('starts with a URL without hash', async () => {
	const {url} = await loadModule();
	expect(get(url)).toBe('https://github.com/refined-github/refined-github?tab=readme');
});

it('updates on pushState/replaceState URL changes and ignores hash-only changes', async () => {
	const {url} = await loadModule();
	const values: string[] = [];
	const unsubscribe = url.subscribe(value => {
		values.push(value);
	});

	history.pushState(history.state, '', '#updated');
	history.pushState(history.state, '', '/refined-github/refined-github/issues#details');
	history.replaceState(history.state, '', '/refined-github/refined-github/pulls#review');

	unsubscribe();

	expect(values).toEqual([
		'https://github.com/refined-github/refined-github?tab=readme',
		'https://github.com/refined-github/refined-github/issues',
		'https://github.com/refined-github/refined-github/pulls',
	]);
});

it('updates on popstate', async () => {
	const originalReplaceState = history.replaceState;
	const {url} = await loadModule();
	const values: string[] = [];
	const unsubscribe = url.subscribe(value => {
		values.push(value);
	});

	originalReplaceState.call(history, history.state, '', 'https://github.com/refined-github/refined-github/discussions#tab');
	globalThis.dispatchEvent(new PopStateEvent('popstate'));

	unsubscribe();
	expect(values.at(-1)).toBe('https://github.com/refined-github/refined-github/discussions');
});

it('updates on navigation events when available', async () => {
	const fakeNavigation = new EventTarget();
	vi.stubGlobal('navigation', fakeNavigation);

	const {url} = await loadModule();
	const values: string[] = [];
	const unsubscribe = url.subscribe(value => {
		values.push(value);
	});

	const navigateEvent = new Event('navigate') as NavigateEvent;
	Object.defineProperty(navigateEvent, 'destination', {
		value: {
			url: 'https://github.com/refined-github/refined-github/actions#job',
		},
	});
	fakeNavigation.dispatchEvent(navigateEvent);

	unsubscribe();
	expect(values.at(-1)).toBe('https://github.com/refined-github/refined-github/actions');
});
