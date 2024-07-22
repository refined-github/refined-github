import delegate, {DelegateEvent} from 'delegate-it';
import onetime from 'onetime';

import features from '../feature-manager.js';
import {isMac} from '../github-helpers/index.js';

function commandPaletteKeydown(event: DelegateEvent<KeyboardEvent>): void {
	const {key, ctrlKey, delegateTarget} = event;

	if (!ctrlKey || (key !== 'n' && key !== 'p')) {
		return;
	}

	event.preventDefault();

	const targetKey = key === 'n' ? 'ArrowDown' : 'ArrowUp';
	delegateTarget.dispatchEvent(new KeyboardEvent('keydown', {bubbles: true, key: targetKey, code: targetKey}));
}

function init(): void {
	delegate('command-palette', 'keydown', commandPaletteKeydown);
}

void features.add(import.meta.url, {
	asLongAs: [
		() => isMac,
	],
	shortcuts: {
		'ctrl n': 'Select next item in command palette',
		'ctrl p': 'Select previous item in command palette',
	},
	init: onetime(init),
});
