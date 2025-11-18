import React from 'dom-chef';
import {css} from 'code-tag';
import type {ParseSelector} from 'typed-query-selector/parser.js';
import domLoaded from 'dom-loaded';
import {signalFromPromise} from 'abort-utils';

import delay from '../helpers/delay.js';
import onetime from '../helpers/onetime.js';
import optionsStorage from '../options-storage.js';
import getCallerID from './caller-id.js';
import {parseFeatureNameFromStack} from './errors.js';

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

		signal = signal ? AbortSignal.any([signal, delayedDomReady]) : delayedDomReady;
	}

	const selector = typeof selectors === 'string' ? selectors : selectors.join(',\n');
	const seenMark = 'rgh-seen-' + getCallerID(ancestor);

	registerAnimation();

	const rule = document.createElement('style');
	// Enable when/if needed
	// if (isDevelopmentVersion()) {
	// 	// For debuggability
	// 	rule.setAttribute('s', selector);
	// }

	rule.textContent = css`
		:where(${String(selector)}):not(.${seenMark}) {
			animation: 1ms ${animation};
		}
	`;
	document.body.prepend(rule);
	signal?.addEventListener('abort', () => {
		rule.remove();
	});

	let called = false;
	// Capture stack outside
	const currentFeature = parseFeatureNameFromStack();
	(async () => {
		const {logging} = await optionsStorage.getAll();
		if (!logging) {
			return;
		}

		await domLoaded;
		await delay(1000);
		if (!called && !signal?.aborted) {
			console.warn(currentFeature, '→ Selector not found on page:', selector);
		}
	})();

	globalThis.addEventListener('animationstart', (event: AnimationEvent) => {
		const target = event.target as ExpectedElement;
		// The target can match a selector even if the animation actually happened on a ::before pseudo-element, so it needs an explicit exclusion here
		if (target.classList.contains(seenMark) || !target.matches(selector)) {
			return;
		}

		called = true;

		// Removes this specific selector’s animation once it was seen
		target.classList.add(seenMark);

		listener(target, {signal});
	}, {once, signal});
}

// Untested, likely breaks due to wrong `ancestor` level
export async function waitForElement<
	Selector extends string,
	ExpectedElement extends ParseSelector<Selector, HTMLElement | SVGElement>,
>(
	selectors: Selector | readonly Selector[],
	{signal, stopOnDomReady}: Options = {},
): Promise<ExpectedElement | void> {
	const local = new AbortController();
	signal = signal ? AbortSignal.any([signal, local.signal]) : local.signal;

	return new Promise<ExpectedElement | void>(resolve => {
		observe<Selector, ExpectedElement>(selectors, element => {
			resolve(element);
			local.abort();
		}, {signal, stopOnDomReady, once: true});

		signal.addEventListener('abort', () => {
			resolve();
		});
	});
}
