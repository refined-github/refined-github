import React from 'dom-chef';

import {isMac} from './index.js';

export function registerHotkey(hotkey: string, action: VoidFunction | string, {signal}: SignalAsOptions): void {
	const element = typeof action === 'string'
		? <a hidden href={action} data-hotkey={hotkey} />
		: <button hidden type="button" data-hotkey={hotkey} onClick={action} />;

	document.body.append(element);

	signal?.addEventListener('abort', () => {
		element.remove();
	});
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
