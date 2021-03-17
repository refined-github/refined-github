import select from 'select-dom';
import delegate from 'delegate-it';

function onFieldKeydown(selector: string, callback: delegate.EventHandler<KeyboardEvent, HTMLTextAreaElement | HTMLInputElement>): void {
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

export function onCommentFieldKeydown (callback: delegate.EventHandler): void {
	onFieldKeydown('.js-comment-field, #commit-description-textarea', callback);
};

export function onTitleFieldKeydown (callback: delegate.EventHandler): void {
	onFieldKeydown('#issue_title', callback);
};
