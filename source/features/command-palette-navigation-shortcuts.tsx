import select from 'select-dom';
import onetime from 'onetime';

import features from '.';

function commandPaletteKeydown({key, ctrlKey, currentTarget}: KeyboardEvent): void {
	if (!currentTarget || !ctrlKey || (key !== 'n' && key !== 'p')) {
		return;
	}

	const targetKey = key === 'n' ? 'ArrowDown' : 'ArrowUp';
	currentTarget.dispatchEvent(new KeyboardEvent('keydown', {bubbles: true, key: targetKey, code: targetKey}));
}

function init(): void {
	const commandPalette = select('command-palette');

	if (!commandPalette) {
		return;
	}

	commandPalette.addEventListener('keydown', commandPaletteKeydown);
}

void features.add(import.meta.url, {
	shortcuts: {
		'ctrl n': 'Select next item in command palette',
		'ctrl p': 'Select previous item in command palette',
	},
	awaitDomReady: false,
	init: onetime(init),
});
