import React from 'dom-chef';

export default function registerHotkey(hotkey: string, handler: VoidFunction): Deinit {
	const hotkeyButton = <button hidden type="button" data-hotkey={hotkey} onClick={handler}/>;
	document.body.append(hotkeyButton);

	return () => {
		if (hotkeyButton.isConnected) {
			hotkeyButton.remove();
		}
	};
}
