import select from 'select-dom';
import delegate from 'delegate-it';

import features from '.';

function handleEscPress(event: delegate.Event<KeyboardEvent>): void {
	if (event.key === 'Escape') {
		select('.js-cancel-issue-edit')!.click();

		event.stopImmediatePropagation();
		event.preventDefault();
	}
}

function init(): void {
	delegate(document, '#issue_title', 'keydown', handleEscPress);
}

void features.add(__filebasename, {
	shortcuts: {
		esc: 'Cancel editing a conversation title'
	},
	awaitDomReady: false,
	init
});
