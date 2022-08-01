import React from 'dom-chef';

export function registerHotkey(hotkey: string, action: VoidFunction | string): Deinit {
	const element = typeof action === 'string'
		? <a hidden href={action} data-hotkey={hotkey}/>
		: <button hidden type="button" data-hotkey={hotkey} onClick={action}/>;

	document.body.append(element);

	return () => {
		element.remove();
	};
}

/** Safely add a hotkey to an element, preserving any existing ones and avoiding duplicates */
export const addHotkey = (button: HTMLAnchorElement | HTMLButtonElement | undefined, hotkey: string): void => {
	if (button) {
		const hotkeys = new Set(button.dataset.hotkey?.split(','));
		hotkeys.add(hotkey);
		button.dataset.hotkey = [...hotkeys].join(',');
	}
};
