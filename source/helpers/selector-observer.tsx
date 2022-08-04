import mem from 'mem';
import React from 'dom-chef';
import {css} from 'code-tag';
import onetime from 'onetime';
import {ParseSelector} from 'typed-query-selector/parser';

const animation = 'rgh-selector-observer';
const tracked = new Map<string, WeakSet<EventTarget>>();
const getListener = mem(<ExpectedElement extends HTMLElement>(selector: string, callback: (element: ExpectedElement) => void) => function (event: AnimationEvent) {
	const target = event.target as ExpectedElement;
	if (tracked.get(selector)?.has(target) || !target.matches(selector)) {
		return;
	}

	if (!/shortenLink|bypass/.test(callback.toString())) {
		console.log('selector-observer', target, callback);
	}

	tracked.get(selector)!.add(target);

	callback(target);
});

const getTag = onetime((): JSX.Element => {
	const style = <style>{`@keyframes ${animation} {}`}</style>;
	document.head.append(style);
	return style;
});

export default function observe<
	Selector extends string,
	ExpectedElement extends HTMLElement = ParseSelector<Selector, HTMLElement>,
>(
	selectors: Selector | readonly Selector[],
	listener: (element: ExpectedElement) => void,
	{signal}: {signal?: AbortSignal} = {},
): void {
	if (signal?.aborted) {
		return;
	}

	const selector = String(selectors); // Array#toString() creates a comma-separated string
	const rule = new Text(css`
		:where(${String(selector)}) {
			animation: 1ms ${animation};
		}
	`);
	tracked.set(String(selector), new WeakSet());
	getTag().append(rule);
	signal?.addEventListener('abort', () => {
		rule.remove();
	});
	window.addEventListener('animationstart', getListener(selector, listener), {signal});
}
