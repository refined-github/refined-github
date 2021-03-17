import select from 'select-dom';
import delegate from 'delegate-it';

import features from '.';
import {onTitleFieldKeydown} from '../github-events/on-field-keydown';

function handleEscPress(event: delegate.Event<KeyboardEvent>): void {
	if (event.key === 'Escape') {
		select('.js-cancel-issue-edit')!.click();

		event.stopImmediatePropagation();
		event.preventDefault();
	}
}

function init(): void {
	onTitleFieldKeydown(handleEscPress);
}

void features.add(__filebasename, {
	shortcuts: {
		esc: 'Cancel editing a conversation title'
	},
	awaitDomReady: false,
	init
});
