import {elementExists} from 'select-dom';
import delegate, {DelegateEventHandler} from 'delegate-it';

type DelegateFieldEvent = DelegateEventHandler<KeyboardEvent, HTMLTextAreaElement>;

function onFieldKeydown(selector: string, callback: DelegateFieldEvent, signal: AbortSignal): void {
	delegate(selector as 'textarea', 'keydown', event => {
		const field = event.delegateTarget;

		// The suggester is GitHub’s autocomplete dropdown
		if (elementExists('.suggester', field.form!) || event.isComposing) {
			return;
		}

		callback(event);
	}, {
		// Adds support for `esc` key; GitHub seems to use `stopPropagation` on it
		capture: true,
		signal,
	});
}

export function onCommentFieldKeydown(callback: DelegateFieldEvent, signal: AbortSignal): void {
	onFieldKeydown('.js-comment-field, #commit-description-textarea, #merge_message_field', callback, signal);
}

export function onConversationTitleFieldKeydown(callback: DelegateFieldEvent, signal: AbortSignal): void {
	onFieldKeydown('#issue_title, #pull_request_title', callback, signal);
}

export function onCommitTitleFieldKeydown(callback: DelegateFieldEvent, signal: AbortSignal): void {
	onFieldKeydown('#commit-summary-input', callback, signal);
}
