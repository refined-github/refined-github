import select from 'select-dom';
import onetime from 'onetime';

import features from '.';

function commandPaletteKeydown({key, ctrlKey}: KeyboardEvent): void {
	if (!ctrlKey || (key !== 'n' && key !== 'p')) {
		return;
	}

	const commandPalette = select('command-palette');

	if (!commandPalette) {
		return;
	}

	const targetKey = key === 'n' ? 'ArrowDown' : 'ArrowUp';
	commandPalette.dispatchEvent(new KeyboardEvent('keydown', {bubbles: true, key: targetKey, code: targetKey}));
}

function init(): void {
	document.addEventListener('keydown', commandPaletteKeydown);
}

void features.add(import.meta.url, {
	shortcuts: {
		'ctrl n': 'Select next item in command palette',
		'ctrl p': 'Select previous item in command palette',
	},
	awaitDomReady: false,
	init: onetime(init),
});
