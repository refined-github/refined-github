import delegate from 'delegate-it';
import onetime from 'onetime';

import features from '.';

function commandPaletteKeydown(event: delegate.Event<KeyboardEvent>): void {
	const {key, ctrlKey, target} = event;

	if (!target || !ctrlKey || !['n', 'p', 'j', 'k'].includes(key)) {
		return;
	}

	event.preventDefault();

	const targetKey = key === 'n' || key === 'j' ? 'ArrowDown' : 'ArrowUp';
	target.dispatchEvent(new KeyboardEvent('keydown', {bubbles: true, key: targetKey, code: targetKey}));
}

function init(): void {
	delegate(document, 'command-palette', 'keydown', commandPaletteKeydown);
}

void features.add(import.meta.url, {
	shortcuts: {
		'ctrl j': 'Select next item in command palette',
		'ctrl k': 'Select previous item in command palette',
	},
	awaitDomReady: false,
	init: onetime(init),
});
