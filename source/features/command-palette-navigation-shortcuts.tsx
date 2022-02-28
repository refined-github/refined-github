import delegate from 'delegate-it';
import onetime from 'onetime';

import features from '.';
import {isMac} from '../github-helpers';

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

void features.add(import.meta.url, {
	include: [
		() => isMac,
	],
	shortcuts: {
		'ctrl n': 'Select next item in command palette',
		'ctrl p': 'Select previous item in command palette',
	},
	awaitDomReady: false,
	init: onetime(init),
});
