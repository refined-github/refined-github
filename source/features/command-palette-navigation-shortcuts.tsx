import delegate from 'delegate-it';
import type {DelegateEvent} from 'delegate-it';

import {isMac} from '../github-helpers/index.js';
import features from '../feature-manager.js';
import onetime from '../helpers/onetime.js';

function commandPaletteKeydown(event: DelegateEvent<KeyboardEvent>): void {
	const {key, ctrlKey, delegateTarget} = event;

	if (!ctrlKey || (key !== 'n' && key !== 'p')) {
		return;
	}

	event.preventDefault();

	const targetKey = key === 'n' ? 'ArrowDown' : 'ArrowUp';
	delegateTarget.dispatchEvent(new KeyboardEvent('keydown', {bubbles: true, key: targetKey, code: targetKey}));
}

function initOnce(): void {
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
	init: onetime(initOnce),
});

/*

Test URLs:

Mac only, any page, like https://github.com/refined-github/refined-github/pull/5432

*/
