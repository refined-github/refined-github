import {$$} from 'select-dom';
import {expect, test, vi} from 'vitest';

import features from './feature-manager.js';
import observe from './helpers/selector-observer.js';

vi.mock('dom-loaded', () => ({default: Promise.resolve()}));
vi.mock('webext-detect', () => ({isWebPage: () => true}));
vi.mock('webext-msg', () => ({messageRuntime: async () => ''}));
vi.mock('./options-storage.js', () => ({
	default: {getAll: async () => ({logging: false, logHttp: false, customCss: ''})},
	isFeatureDisabled: () => false,
}));
vi.mock('./options/reload-without.js', () => ({contentScriptToggle: {get: async () => true}}));
vi.mock('./helpers/errors.js', () => ({
	catchErrors: vi.fn(),
	disableErrorLogging: vi.fn(),
	logError(error: Error) {
		throw error;
	},
	parseFeatureNameFromStack: () => undefined,
}));
vi.mock('./helpers/bisect.js', () => ({default: async () => undefined}));
vi.mock('./helpers/hotfix.js', () => ({
	applyStyleHotfixes: vi.fn(),
	brokenFeatures: {getCached: async () => undefined, get: async () => undefined},
	brokenFeaturesAsOptions: () => ({}),
	preloadSyncLocalStrings: async () => undefined,
}));

const tick = async (): Promise<void> =>
	new Promise(resolve => {
		setTimeout(resolve, 10);
	});

const observerStyles = (): HTMLStyleElement[] =>
	$$('style')
		.filter(style => style.textContent.includes('animation: 1ms rgh-selector-observer'));

// https://github.com/refined-github/refined-github/issues/10311
test('React navigations stop the previous run of a feature', async () => {
	const signals: AbortSignal[] = [];
	void features.add('/features/test-react-navigation.tsx', {
		init(signal) {
			signals.push(signal);
			observe('.test-react-navigation', () => {/* Noop */}, {signal});
		},
	});

	await tick();
	expect(signals).toHaveLength(1);
	expect(observerStyles()).toHaveLength(1);

	for (let navigation = 0; navigation < 3; navigation++) {
		document.dispatchEvent(new Event('soft-nav:react-done'));
		await tick(); // eslint-disable-line no-await-in-loop -- Sequential navigations
	}

	expect(signals).toHaveLength(4);
	expect(signals.map(signal => signal.aborted)).toEqual([true, true, true, false]);
	expect(observerStyles()).toHaveLength(1);
});
