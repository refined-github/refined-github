import delegate from 'delegate-it';
import onetime from 'onetime';

import features from '.';

function commandPaletteKeydown({key, ctrlKey, target}: delegate.Event<KeyboardEvent>): void {
	if (!target || !ctrlKey || (key !== 'n' && key !== 'p')) {
		return;
	}

	const targetKey = key === 'n' ? 'ArrowDown' : 'ArrowUp';
	target.dispatchEvent(new KeyboardEvent('keydown', {bubbles: true, key: targetKey, code: targetKey}));
}

function init(): void {
	delegate(document, 'command-palette', 'keydown', commandPaletteKeydown);
}

void features.add(import.meta.url, {
	shortcuts: {
		'ctrl n': 'Select next item in command palette',
		'ctrl p': 'Select previous item in command palette',
	},
	awaitDomReady: false,
	init: onetime(init),
});
