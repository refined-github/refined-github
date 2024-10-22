import React from 'dom-chef';
import {css} from 'code-tag';
import onetime from 'onetime';
import {ParseSelector} from 'typed-query-selector/parser.js';
import delay from 'delay';
import domLoaded from 'dom-loaded';
import {signalFromPromise} from 'abort-utils';

import getCallerID from './caller-id.js';

type ObserverListener<ExpectedElement extends Element> = (element: ExpectedElement, options: SignalAsOptions) => void;

type Options = {
	stopOnDomReady?: boolean;
	once?: boolean;
	signal?: AbortSignal;
};

const animation = 'rgh-selector-observer';
const getListener = <
	Selector extends string,
	ExpectedElement extends ParseSelector<Selector, HTMLElement | SVGElement>,
>(
	seenMark: string,
	selector: Selector,
	callback: ObserverListener<ExpectedElement>,
	signal?: AbortSignal,
) => (event: AnimationEvent) => {
	const target = event.target as ExpectedElement;
	// The target can match a selector even if the animation actually happened on a ::before pseudo-element, so it needs an explicit exclusion here
	if (target.classList.contains(seenMark) || !target.matches(selector)) {
		return;
	}

	// Removes this specific selector’s animation once it was seen
	target.classList.add(seenMark);

	callback(target, {signal});
};

const registerAnimation = onetime((): void => {
	document.head.append(<style>{`@keyframes ${animation} {}`}</style>);
});

export default function observe<
	Selector extends string,
	ExpectedElement extends ParseSelector<Selector, HTMLElement | SVGElement>,
>(
	selectors: Selector | readonly Selector[],
	listener: ObserverListener<ExpectedElement>,
	{signal, stopOnDomReady, once}: Options = {},
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

	const selector = String(selectors); // Array#toString() creates a comma-separated string
	const seenMark = 'rgh-seen-' + getCallerID();

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
	globalThis.addEventListener('animationstart', getListener(seenMark, selector, listener, signal), {once, signal});
}

// Untested
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
