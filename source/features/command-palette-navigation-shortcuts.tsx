import delegate from 'delegate-it';
import onetime from 'onetime';

import features from '.';

function commandPaletteKeydown(event: delegate.Event<KeyboardEvent>): void {
	const {key, ctrlKey, target} = event;

	if (!target || !ctrlKey || (key !== 'n' && key !== 'p')) {
		return;
	}

	event.preventDefault();

	const targetKey = key === 'n' ? 'ArrowDown' : 'ArrowUp';
	target.dispatchEvent(new KeyboardEvent('keydown', {bubbles: true, key: targetKey, code: targetKey}));
}

function init(): void {
	delegate(document, 'command-palette', 'keydown', commandPaletteKeydown);
}

const onMacOs = !!navigator.userAgent.match(/Macintosh/);

if (onMacOs) {
	void features.add(import.meta.url, {
		shortcuts: {
			'ctrl n': 'Select next item in command palette',
			'ctrl p': 'Select previous item in command palette',
		},
		awaitDomReady: false,
		init: onetime(init),
	});
}
