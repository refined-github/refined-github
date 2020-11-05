import select from 'select-dom';
import delegate from 'delegate-it';

export default function onIssueTitleKeydown(callback: delegate.EventHandler<KeyboardEvent, HTMLTextAreaElement>): void {
	delegate<HTMLTextAreaElement, KeyboardEvent>(document, '#issue_title', 'keydown', event => {
		const field = event.delegateTarget;
		// Don't do anything if the autocomplete helper is shown or if non-latin input is being used
		if (select.exists('.suggester', field.form!) || event.isComposing) {
			return;
		}

		callback(event);
	}, {
		// Adds support for `esc` key; GitHub seems to use `stopPropagation` on it
		capture: true
	});
}
