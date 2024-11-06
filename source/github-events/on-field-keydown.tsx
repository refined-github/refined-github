import {elementExists} from 'select-dom';
import delegate, {type DelegateEventHandler} from 'delegate-it';

type DelegateFieldEvent = DelegateEventHandler<KeyboardEvent, HTMLTextAreaElement>;

function onFieldKeydown(selector: string, callback: DelegateFieldEvent, signal: AbortSignal): void {
	delegate(selector as 'textarea', 'keydown', event => {
		const field = event.delegateTarget;

		if (
			event.isComposing
			// New autocomplete dropdown
			|| field.hasAttribute('aria-autocomplete')
			// Classic autocomplete dropdown
			|| elementExists('.suggester', field.form!)
		) {
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
	onFieldKeydown('textarea', callback, signal);
}

export function onConversationTitleFieldKeydown(callback: DelegateFieldEvent, signal: AbortSignal): void {
	onFieldKeydown('input[placeholder="Title"], #issue_title, #pull_request_title', callback, signal);
}

export function onCommitTitleFieldKeydown(callback: DelegateFieldEvent, signal: AbortSignal): void {
	onFieldKeydown('#commit-summary-input', callback, signal);
}
