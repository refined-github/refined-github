import delegate, {type DelegateEventHandler} from 'delegate-it';
import memoize from 'memoize';
import ManyKeysMap from 'many-keys-map';
import {elementExists} from 'select-dom';

type TextField = HTMLTextAreaElement | HTMLInputElement;
type KeydownHandler = DelegateEventHandler<KeyboardEvent, TextField>;

function _onFieldKeydown(selector: string | readonly string[], callback: KeydownHandler, signal: AbortSignal): void {
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

const onFieldKeydown = memoize(_onFieldKeydown, {
	// https://github.com/sindresorhus/memoize#example-multiple-non-serializable-arguments
	cacheKey: arguments_ => arguments_,
	cache: new ManyKeysMap(),
});

export function onCommentFieldKeydown(callback: KeydownHandler, signal: AbortSignal): void {
	onFieldKeydown('textarea', callback, signal);
}

export function onConversationTitleFieldKeydown(callback: KeydownHandler, signal: AbortSignal): void {
	onFieldKeydown(
		[
			'[class^="prc-PageLayout-Header"] input', // PR
			'input[placeholder="Title"]', // Issue
			// Old PR view
			// TODO [2027-01-01]: Remove
			'#issue_title',
			// Old compare view
			// TODO [2026-09-01]: Remove
			'#pull_request_title',
		],
		callback,
		signal,
	);
}

export function onCommitTitleFieldKeydown(callback: KeydownHandler, signal: AbortSignal): void {
	onFieldKeydown('#commit-summary-input', callback, signal);
}
