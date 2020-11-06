import select from 'select-dom';
import onetime from 'onetime';
import delegate from 'delegate-it';

import features from '.';

function eventHandler(event: delegate.Event<KeyboardEvent, HTMLInputElement>): void {
	if (event.key === 'Escape') {
		const cancelButton = select<HTMLLinkElement>(`
				.js-cancel-issue-edit
			`);
		cancelButton?.click();

		event.stopImmediatePropagation();
		event.preventDefault();
	}
}

function init(): void {
	delegate<HTMLInputElement, KeyboardEvent>(document, '#issue_title', 'keydown', event => {
		eventHandler(event);
	}, {
		capture: true
	});
}

void features.add(__filebasename, {
	shortcuts: {
		esc: 'Cancel issue title edit'
	},
	awaitDomReady: false,
	init: onetime(init)
});
