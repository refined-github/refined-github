import React from 'dom-chef';

import {isMac} from './index.js';

const isEditable = (node: unknown): boolean => {
	if (!(node instanceof Element)) {
		return false;
	}

	return node.matches('textarea, input') || (node as HTMLElement).isContentEditable;
};

export function registerHotkey(
	hotkey: string,
	functionOrUrl: React.MouseEventHandler<HTMLButtonElement> | string,
	{signal}: SignalAsOptions = {},
): void {
	if (signal?.aborted) {
		return;
	}

	const element = typeof functionOrUrl === 'string'
		? <a hidden href={functionOrUrl} data-hotkey={hotkey} />
		: <button hidden type="button" data-hotkey={hotkey} onClick={functionOrUrl} />;

	document.body.prepend(element);

	signal?.addEventListener('abort', () => {
		element.remove();
	}, {once: true});
}

const hotkeySequenceTimeout = 1000;

export function registerHotkeyManually(
	hotkey: string,
	functionOrUrl: React.MouseEventHandler<HTMLButtonElement> | string,
	{signal}: SignalAsOptions = {},
): void {
	if (signal?.aborted) {
		return;
	}

	const keys = hotkey.toLowerCase().trim().split(/\s+/).filter(Boolean);
	if (keys.length === 0) {
		throw new TypeError('Expected at least one key in hotkey sequence');
	}

	const element = typeof functionOrUrl === 'string'
		? <a hidden href={functionOrUrl} />
		: <button hidden type="button" onClick={functionOrUrl} />;

	document.body.prepend(element);

	let currentKey = 0;
	let sequenceTimeout: ReturnType<typeof setTimeout> | undefined;
	const resetSequence = (): void => {
		currentKey = 0;
		clearTimeout(sequenceTimeout);
	};

	signal?.addEventListener('abort', () => {
		element.remove();
		resetSequence();
	}, {once: true});

	document.addEventListener('keydown', event => {
		if (isEditable(event.target) || event.altKey || event.ctrlKey || event.metaKey) {
			resetSequence();
			return;
		}

		const key = event.key.toLowerCase();
		if (key === keys[currentKey]) {
			currentKey += 1;
			clearTimeout(sequenceTimeout);
			sequenceTimeout = setTimeout(resetSequence, hotkeySequenceTimeout);

			if (currentKey === keys.length) {
				resetSequence();
				event.preventDefault();
				event.stopPropagation();
				element.click();
			}

			return;
		}

		if (key === keys[0]) {
			currentKey = 1;
			clearTimeout(sequenceTimeout);
			sequenceTimeout = setTimeout(resetSequence, hotkeySequenceTimeout);
			return;
		}

		resetSequence();
	}, {capture: true, signal});
}

/** Safely add a hotkey to an element, preserving any existing ones and avoiding duplicates */
export function addHotkey(button: HTMLAnchorElement | HTMLButtonElement | undefined, hotkey: string): void {
	if (button) {
		const hotkeys = new Set(button.dataset.hotkey?.split(','));
		hotkeys.add(hotkey);
		button.dataset.hotkey = [...hotkeys].join(',');
	}
}

// eslint-disable-next-line unicorn/prevent-abbreviations
export const modKey = isMac ? 'cmd' : 'ctrl';
