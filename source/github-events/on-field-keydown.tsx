import select from 'select-dom';
import delegate from 'delegate-it';

type DelegateFieldEvent = delegate.EventHandler<KeyboardEvent, HTMLTextAreaElement>;

function onFieldKeydown(selector: string, callback: DelegateFieldEvent): void {
	delegate<HTMLTextAreaElement, KeyboardEvent>(document, selector, 'keydown', event => {
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

export function onCommentFieldKeydown(callback: DelegateFieldEvent): void {
	onFieldKeydown('.js-comment-field, #commit-description-textarea', callback);
}

export function onTitleFieldKeydown(callback: DelegateFieldEvent): void {
	onFieldKeydown('#issue_title', callback);
}
