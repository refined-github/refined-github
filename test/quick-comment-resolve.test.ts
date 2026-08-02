import type * as domChef from 'dom-chef';
import {$, $$, $optional} from 'select-dom';
import {afterEach, describe, expect, test, vi} from 'vitest';

import {addQuickResolveButton, addQuickResolveButtonLegacy} from '../source/features/quick-comment-resolve.js';

// The feature's registration and `observe` need browser-extension APIs (options storage, message
// passing) and Svelte tooltips that aren't available in the test environment, so only the
// DOM-specific logic is exercised here via its exported functions.
vi.mock('../source/feature-manager.js', () => ({
	default: {
		add() {
			return undefined;
		},
		unload() {
			return undefined;
		},
		addCssFeature() {
			return undefined;
		},
	},
}));
vi.mock('../source/helpers/selector-observer.js', () => ({
	default() {
		return undefined;
	},
}));
vi.mock('../source/components/tooltip.js', () => ({
	withTooltipRef() {
		return () => undefined;
	},
	addTooltip() {
		return undefined;
	},
	default() {
		return undefined;
	},
}));
// The extension build aliases `react` to `dom-chef`, so octicons render as real DOM nodes there.
// In tests, `dom-chef` expects function components to return actual DOM nodes.
vi.mock('octicons-plain-react/Check', () => ({
	default() {
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('class', 'octicon octicon-check');
		return svg;
	},
}));
// Vite's dev-mode JSX transform injects `__self`/`__source` props, which `dom-chef` would set as
// DOM attributes. The production build (sucrase) doesn't add them, so strip them here.
vi.mock('dom-chef', async importOriginal => {
	const actual = await importOriginal<typeof domChef>();
	const createElement = (
		type: Parameters<typeof domChef.createElement>[0],
		attributes: Parameters<typeof domChef.createElement>[1],
		...children: Node[]
	): ReturnType<typeof domChef.createElement> => {
		const filteredAttributes = attributes
			? Object.fromEntries(Object.entries(attributes).filter(([key]) => key !== '__self' && key !== '__source'))
			: undefined;

		return actual.createElement(type, filteredAttributes, ...children);
	};

	return {
		...actual,
		createElement,
		default: {
			...actual.default,
			createElement,
		},
	};
});

function createThread({resolved = false, resolvable = true} = {}): HTMLElement {
	const thread = document.createElement('div');
	thread.className = 'js-comment-container js-resolvable-timeline-thread-container';
	thread.dataset.resolved = String(resolved);

	// Review comment with its kebab dropdown
	const comment = document.createElement('div');
	comment.className = 'js-comment';
	const actions = document.createElement('div');
	actions.className = 'timeline-comment-actions';
	const kebab = document.createElement('details');
	kebab.className = 'position-relative';
	actions.append(kebab);
	comment.append(actions);

	// GitHub only renders the native resolve form on unresolved, resolvable conversations
	if (resolvable && !resolved) {
		const form = document.createElement('form');
		form.action = '/refined-github/yolo/pull/8/review_comment/123/resolve';
		form.append(Object.assign(document.createElement('button'), {type: 'submit'}));
		thread.append(form);
	}

	thread.append(comment);
	return thread;
}

function createReactHeader(thread: HTMLElement): {header: HTMLElement; menuButton: HTMLButtonElement} {
	const header = document.createElement('div');
	header.dataset.testid = 'comment-header';
	const menuButton = Object.assign(document.createElement('button'), {'data-component': 'IconButton'});
	menuButton.append(document.createElement('span'));
	header.append(menuButton);
	thread.append(header);
	return {header, menuButton};
}

afterEach(() => {
	document.body.replaceChildren();
});

describe('quick-comment-resolve', () => {
	test('adds a resolve button to an unresolved, resolvable conversation', () => {
		const thread = createThread();
		document.body.append(thread);

		addQuickResolveButtonLegacy($('details', thread));

		expect($optional('.rgh-quick-comment-resolve-button', thread)).toBeTruthy();
	});

	test('clicking the button triggers GitHub’s native resolve control', () => {
		const thread = createThread();
		document.body.append(thread);
		const submitButton = $('form button[type="submit"]', thread);
		let submitClicks = 0;
		submitButton.addEventListener('click', () => {
			submitClicks++;
		});

		addQuickResolveButtonLegacy($('details', thread));
		$('.rgh-quick-comment-resolve-button', thread).click();

		expect(submitClicks).toBe(1);
	});

	test('adds a button to React comment headers too', () => {
		const thread = createThread();
		document.body.append(thread);
		const {header, menuButton} = createReactHeader(thread);

		void addQuickResolveButton(menuButton, {signal: new AbortController().signal});

		expect($('button', header)).toBeTruthy();
		expect($optional('.octicon-check', $('button', header))).toBeTruthy();
	});

	test('React button click triggers GitHub’s native resolve control', () => {
		const thread = createThread();
		document.body.append(thread);
		const {header, menuButton} = createReactHeader(thread);
		const submitButton = $('form button[type="submit"]', thread);
		let submitClicks = 0;
		submitButton.addEventListener('click', () => {
			submitClicks++;
		});

		void addQuickResolveButton(menuButton, {signal: new AbortController().signal});
		$('button', header).click();

		expect(submitClicks).toBe(1);
	});

	test('does not add a button to resolved conversations', () => {
		const thread = createThread({resolved: true});
		document.body.append(thread);

		addQuickResolveButtonLegacy($('details', thread));

		expect($optional('.rgh-quick-comment-resolve-button', thread)).toBeUndefined();
	});

	test('does not add a button to non-resolvable conversations', () => {
		// Unresolved, but GitHub renders no resolve form (no permission or thread not resolvable)
		const thread = createThread({resolvable: false});
		document.body.append(thread);

		addQuickResolveButtonLegacy($('details', thread));

		expect($optional('.rgh-quick-comment-resolve-button', thread)).toBeUndefined();
	});

	test('does not add a button to regular comments outside review threads', () => {
		// A regular issue/PR comment: no thread container, no resolve form
		const comment = document.createElement('div');
		comment.className = 'js-comment';
		const actions = document.createElement('div');
		actions.className = 'timeline-comment-actions';
		const kebab = document.createElement('details');
		kebab.className = 'position-relative';
		actions.append(kebab);
		comment.append(actions);
		document.body.append(comment);

		addQuickResolveButtonLegacy(kebab);

		expect($optional('.rgh-quick-comment-resolve-button', comment)).toBeUndefined();
	});

	test('running initialization again does not create duplicates', () => {
		const thread = createThread();
		document.body.append(thread);
		const kebab = $('details', thread);

		addQuickResolveButtonLegacy(kebab);
		addQuickResolveButtonLegacy(kebab);

		expect($$('.rgh-quick-comment-resolve-button', thread)).toHaveLength(1);
	});

	test('running the React path again does not create duplicates', () => {
		const thread = createThread();
		document.body.append(thread);
		const {menuButton} = createReactHeader(thread);

		void addQuickResolveButton(menuButton, {signal: new AbortController().signal});
		void addQuickResolveButton(menuButton, {signal: new AbortController().signal});

		expect($$('.rgh-quick-comment-resolve-button', thread)).toHaveLength(1);
	});

	test('clicking the button only resolves its own conversation', () => {
		const threadA = createThread();
		document.body.append(threadA);
		const threadB = createThread();
		document.body.append(threadB);
		const submitButtonA = $('form button[type="submit"]', threadA);
		const submitButtonB = $('form button[type="submit"]', threadB);
		let clicksA = 0;
		let clicksB = 0;
		submitButtonA.addEventListener('click', () => {
			clicksA++;
		});
		submitButtonB.addEventListener('click', () => {
			clicksB++;
		});

		addQuickResolveButtonLegacy($('details', threadA));
		$('.rgh-quick-comment-resolve-button', threadA).click();

		expect(clicksA).toBe(1);
		expect(clicksB).toBe(0);
	});
});
