import delegate, {type DelegateEventHandler} from 'delegate-it';
import {elementExists} from 'select-dom';

type DelegateField = HTMLTextAreaElement | HTMLInputElement;
type DelegateFieldEvent = DelegateEventHandler<KeyboardEvent, DelegateField>;

function onFieldKeydown(selector: string | readonly string[], callback: DelegateFieldEvent, signal: AbortSignal): void {
	delegate<DelegateField, 'keydown'>(selector, 'keydown', event => {
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
	onFieldKeydown([
		'[class^="prc-PageLayout-Header"] input',
		'input[placeholder="Title"]',
		'#issue_title', // Old issue/PR view - TODO: Remove after July 2026
		'#pull_request_title', // Old compare view - TODO: Remove after August 2026
	], callback, signal);
}

export function onCommitTitleFieldKeydown(callback: DelegateFieldEvent, signal: AbortSignal): void {
	onFieldKeydown('#commit-summary-input', callback, signal);
}
