import {mergeSignals, signalFromPromise} from 'abort-utils';
import {css} from 'code-tag';
import React from 'dom-chef';
import domLoaded from 'dom-loaded';
import type {ParseSelector} from 'typed-query-selector/parser.js';

import optionsStorage from '../options-storage.js';
import getCallerId from './caller-id.js';
import delay from './delay.js';
import {parseFeatureNameFromStack} from './errors.js';
import onetime from './onetime.js';

type ObserverListener<ExpectedElement extends Element> = (element: ExpectedElement, options: SignalAsOptions) => void;

type Options = {
	stopOnDomReady?: boolean;
	once?: boolean;
	signal?: AbortSignal;
	/** Refer to getCallerID's documentation */
	ancestor?: number;
};

const animation = 'rgh-selector-observer';

const registerAnimation = onetime((): void => {
	document.head.append(<style>{`@keyframes ${animation} {}`}</style>);
});

let activeStylesheets = 0;
let highestWarnedCount = 0;

// Warns once per multiple of 50, never again for a count already reached, even if it dropped in between
function trackStylesheet(signal?: AbortSignal): void {
	activeStylesheets++;
	if (activeStylesheets % 50 === 0 && activeStylesheets > highestWarnedCount) {
		highestWarnedCount = activeStylesheets;
		console.warn('Selector observer has', activeStylesheets, 'active stylesheets');
	}

	signal?.addEventListener('abort', () => {
		activeStylesheets--;
	});
}

function addStyle(cssText: string, signal?: AbortSignal): void {
	try {
		const sheet = new CSSStyleSheet();
		sheet.replaceSync(cssText);
		// Mutate in place instead of reassigning, https://bugs.webkit.org/show_bug.cgi?id=254844
		document.adoptedStyleSheets.push(sheet);
		signal?.addEventListener('abort', () => {
			const index = document.adoptedStyleSheets.indexOf(sheet);
			if (index !== -1) {
				document.adoptedStyleSheets.splice(index, 1);
			}
		});
	} catch {
		// Firefox <153 denies content scripts access to adoptedStyleSheets
		const rule = document.createElement('style');
		// Enable when/if needed
		// if (isDevelopmentVersion()) {
		// 	// For debuggability
		// 	rule.setAttribute('s', selector);
		// }

		rule.textContent = cssText;
		document.body.prepend(rule);
		signal?.addEventListener('abort', () => {
			rule.remove();
		});
	}
}

export default function observe<
	Selector extends string,
	ExpectedElement extends ParseSelector<Selector, HTMLElement | SVGElement>,
>(
	selectors: Selector | readonly Selector[],
	listener: ObserverListener<ExpectedElement>,
	{signal, stopOnDomReady, once, ancestor}: Options = {},
): void {
	if (signal?.aborted) {
		return;
	}

	if (stopOnDomReady) {
		const delayedDomReady = signalFromPromise((async () => {
			await domLoaded;
			await delay(100); // Allow the animation and events to complete; Also adds support for ajaxed pages
		})());

		signal = mergeSignals(signal, delayedDomReady);
	}

	let onceController: AbortController | undefined;
	if (once) {
		onceController = new AbortController();
		signal = mergeSignals(signal, onceController.signal);
	}

	const selector = typeof selectors === 'string' ? selectors : selectors.join(',\n');
	const seenMark = 'rgh-seen-' + getCallerId(ancestor);

	registerAnimation();

	addStyle(
		css`
		:where(${selector}):not(.${seenMark}) {
			animation: 1ms ${animation};
		}
	`,
		signal,
	);
	trackStylesheet(signal);

	let wasCalled = false;
	// Capture stack outside
	const currentFeature = parseFeatureNameFromStack();
	(async () => {
		const {logging} = await optionsStorage.getAll();
		if (!logging) {
			return;
		}

		await domLoaded;
		await delay(1000);
		if (!wasCalled && !signal?.aborted) {
			console.warn(currentFeature, '→ Selector not found on page:', selector);
		}
	})();

	globalThis.addEventListener('animationstart', (event: AnimationEvent) => {
		if (event.animationName !== animation) {
			return;
		}

		const target = event.target as ExpectedElement;
		// The target can match a selector even if the animation actually happened on a ::before pseudo-element, so it needs an explicit exclusion here
		if (target.classList.contains(seenMark) || !target.matches(selector)) {
			return;
		}

		wasCalled = true;

		// Removes this specific selector’s animation once it was seen
		target.classList.add(seenMark);

		listener(target, {signal});
		onceController?.abort();
	}, {signal});
}

export async function waitForElement<
	Selector extends string,
	ExpectedElement extends ParseSelector<Selector, HTMLElement | SVGElement>,
>(
	selectors: Selector | readonly Selector[],
	{signal, stopOnDomReady}: Options = {},
): Promise<ExpectedElement | void> {
	return new Promise<ExpectedElement | void>(resolve => {
		observe<Selector, ExpectedElement>(selectors, element => {
			resolve(element);
		}, {
			signal,
			stopOnDomReady,
			once: true,
			ancestor: 4,
		});

		signal?.addEventListener('abort', () => {
			resolve();
		});
	});
}
