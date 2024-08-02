import React from 'dom-chef';
import {css} from 'code-tag';
import onetime from 'onetime';
import {ParseSelector} from 'typed-query-selector/parser.js';

import delay from 'delay';
import domLoaded from 'dom-loaded';
import {signalFromPromise} from 'abort-utils';

import isDevelopmentVersion from './is-development-version.js';
import getCallerID from './caller-id.js';

type ObserverListener<ExpectedElement extends Element> = (element: ExpectedElement, options: SignalAsOptions) => void;

type Options = SignalAsOptions & {stopOnDomReady?: boolean};

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
	{signal, stopOnDomReady}: Options = {},
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
	if (isDevelopmentVersion()) {
		// For debuggability
		rule.setAttribute('s', selector);
	}

	rule.textContent = css`
		:where(${String(selector)}):not(.${seenMark}) {
			animation: 1ms ${animation};
		}
	`;
	document.body.prepend(rule);
	signal?.addEventListener('abort', () => {
		rule.remove();
	});
	window.addEventListener('animationstart', getListener(seenMark, selector, listener, signal), {signal});
}
