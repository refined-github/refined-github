import mem from 'mem';
import React from 'dom-chef';
import {css} from 'code-tag';
import onetime from 'onetime';
import {ParseSelector} from 'typed-query-selector/parser';

import {getSnapshotUUID} from './attach-element';

const animation = 'rgh-selector-observer';
const getListener = mem(<ExpectedElement extends HTMLElement>(seenMark: string, selector: string, callback: (element: ExpectedElement) => void) => function (event: AnimationEvent) {
	const target = event.target as ExpectedElement;
	if (!target.matches(selector)) {
		return;
	}

	// Removes this specific selector’s animation once it was seen
	target.classList.add(seenMark);

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
	const seenMark = 'rgh-seen-' + getSnapshotUUID();
	const rule = new Text(css`
		:where(${String(selector)}):not(.${seenMark}) {
			animation: 1ms ${animation};
		}
	`);
	getTag().append(rule);
	signal?.addEventListener('abort', () => {
		rule.remove();
	});
	window.addEventListener('animationstart', getListener(seenMark, selector, listener), {signal});
}
