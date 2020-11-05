import select from 'select-dom';
import onetime from 'onetime';
import delegate from 'delegate-it';

import features from '.';
import onIssueTitleKeydown from '../github-events/on-issue-title-field-keydown';

function eventHandler(event: delegate.Event<KeyboardEvent, HTMLTextAreaElement>): void {
	const field = event.delegateTarget;
	if (event.key === 'Escape') {
		const cancelButton = select<HTMLLinkElement>(`
				.js-cancel-issue-edit
			`, field.form!);
		// Cancel if there is a button, else blur the field
		if (cancelButton) {
			cancelButton.click();
		} else {
			field.blur();
		}

		event.stopImmediatePropagation();
		event.preventDefault();
	}
}

function init(): void {
	onIssueTitleKeydown(eventHandler);
}

void features.add(__filebasename, {
	shortcuts: {
		esc: 'Cancel issue title edit'
	},
	awaitDomReady: false,
	init: onetime(init)
});
