import delegate, {type DelegateEventHandler} from 'delegate-it';
import {elementExists} from 'select-dom';

type TextField = HTMLTextAreaElement | HTMLInputElement;
type KeydownHandler = DelegateEventHandler<KeyboardEvent, TextField>;

function onFieldKeydown(selector: string | readonly string[], callback: KeydownHandler, signal: AbortSignal): void {
	delegate<TextField, 'keydown'>(selector, 'keydown', event => {
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

export function onCommentFieldKeydown(callback: KeydownHandler, signal: AbortSignal): void {
	onFieldKeydown('textarea', callback, signal);
}

export function onConversationTitleFieldKeydown(callback: KeydownHandler, signal: AbortSignal): void {
	onFieldKeydown([
		'[class^="prc-PageLayout-Header"] input', // PR
		'input[placeholder="Title"]', // Issue
		'#issue_title', // Old PR view - TODO: Remove after legacy PR files view is removed
		'#pull_request_title', // Old compare view - TODO: Remove after August 2026
	], callback, signal);
}

export function onCommitTitleFieldKeydown(callback: KeydownHandler, signal: AbortSignal): void {
	onFieldKeydown('#commit-summary-input', callback, signal);
}
