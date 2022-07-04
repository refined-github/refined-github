import select from 'select-dom';
import delegate from 'delegate-it';

type DelegateFieldEvent = delegate.EventHandler<KeyboardEvent, HTMLTextAreaElement>;

function onFieldKeydown(selector: string, callback: DelegateFieldEvent): delegate.Subscription {
	return delegate<HTMLTextAreaElement, 'keydown'>(document, selector, 'keydown', event => {
		const field = event.delegateTarget;

		// The suggester is GitHub’s autocomplete dropdown
		if (select.exists('.suggester', field.form!) || event.isComposing) {
			return;
		}

		callback(event);
	}, {
		// Adds support for `esc` key; GitHub seems to use `stopPropagation` on it
		capture: true,
	});
}

export function onCommentFieldKeydown(callback: DelegateFieldEvent): delegate.Subscription {
	return onFieldKeydown('.js-comment-field, #commit-description-textarea, #merge_message_field', callback);
}

export function onConversationTitleFieldKeydown(callback: DelegateFieldEvent): delegate.Subscription {
	return onFieldKeydown('#issue_title, #pull_request_title', callback);
}

export function onCommitTitleFieldKeydown(callback: DelegateFieldEvent): delegate.Subscription {
	return onFieldKeydown('#commit-summary-input', callback);
}
