import mem from 'mem';
import React from 'dom-chef';
import onetime from 'onetime';
import {ParseSelector} from 'typed-query-selector/parser';

import hashString from './hash-string';

const tracked = new WeakSet<EventTarget>();
const getListener = mem(<ExpectedElement extends HTMLElement>(id: string, callback: (element: ExpectedElement) => void) => function (event: AnimationEvent) {
	const target = event.target as ExpectedElement;
	if (event.animationName !== id || tracked.has(target)) {
		return;
	}

	tracked.add(target);

	callback(target);
});

const getTag = onetime((): JSX.Element => {
	const style = <style/>;
	document.head.append(style);
	return style;
});
export default function observe<
	Selector extends string,
	ExpectedElement extends HTMLElement = ParseSelector<Selector, HTMLElement>,
>(
	selector: Selector | readonly Selector[],
	listener: (element: ExpectedElement) => void,
	{signal}: {signal?: AbortSignal} = {},
): void {
	if (signal?.aborted) {
		return;
	}

	const id = 'rgh-' + hashString(String(Math.random()));
	const style = new Text(`
		@keyframes ${id} {}
		${String(selector)} {animation: 1ms ${id}}
	`);
	getTag().append(style);
	signal?.addEventListener('abort', () => {
		style.remove();
	});
	window.addEventListener('animationstart', getListener(id, listener), {signal});
}
