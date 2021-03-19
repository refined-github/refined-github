import select from 'select-dom';
import delegate from 'delegate-it';

type DelegateFieldEvent = delegate.EventHandler<KeyboardEvent, HTMLTextAreaElement>;

function onFieldKeydown(selector: string, callback: DelegateFieldEvent): void {
	delegate<HTMLTextAreaElement, KeyboardEvent>(document, selector, 'keydown', event => {
		const field = event.delegateTarget;

		// The suggester is GitHub’s autocomplete dropdown
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

export function onConversationTitleFieldKeydown(callback: DelegateFieldEvent): void {
	onFieldKeydown('#issue_title', callback);
}
