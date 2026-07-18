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
	vi.stubGlobal('navigation', new EventTarget());
});

it('starts with a URL without hash', async () => {
	const {default: url} = await loadModule();
	expect(get(url)).toBe('https://github.com/refined-github/refined-github?tab=readme');
});

it('ignores hash-only navigation events', async () => {
	const {default: url} = await loadModule();
	const values: string[] = [];
	const unsubscribe = url.subscribe(value => {
		values.push(value);
	});

	const navigateEvent = new Event('navigate') as NavigateEvent;
	Object.defineProperty(navigateEvent, 'destination', {
		value: {
			url: 'https://github.com/refined-github/refined-github?tab=readme#updated',
		},
	});
	navigation.dispatchEvent(navigateEvent);

	unsubscribe();

	expect(values).toEqual(['https://github.com/refined-github/refined-github?tab=readme']);
});

it('updates on navigation events', async () => {
	const {default: url} = await loadModule();
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
	navigation.dispatchEvent(navigateEvent);

	unsubscribe();
	expect(values.at(-1)).toBe('https://github.com/refined-github/refined-github/actions');
});
