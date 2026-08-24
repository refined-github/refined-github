/* eslint-disable byo/no-inline-functions -- Covered by memoization */

import delegate, {type DelegateEventHandler} from 'delegate-it';
import memoize from 'memoize';
import {elementExists} from 'select-dom';

type TextField = HTMLTextAreaElement | HTMLInputElement;
type KeydownHandler = DelegateEventHandler<KeyboardEvent, TextField>;

/** Wrapper that skips execution if the user is *in the middle of something*. */
function ignoreInteractive(callback: KeydownHandler): KeydownHandler {
	return event => {
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
	};
}

/**
 Memoizes the creation of the wrapped listener.
 If the same `callback` function reference is passed multiple times,
 it returns the exact same wrapped handler, enabling `delegate-it` deduplication.
 */
const deduplicateInteractiveFilter = memoize((callback: KeydownHandler) => ignoreInteractive(callback));

// Support for `esc` key (where GitHub uses stopPropagation)
const capture = true;

export function onCommentFieldKeydown(callback: KeydownHandler, signal: AbortSignal): void {
	delegate<TextField, 'keydown'>(
		'textarea',
		'keydown',
		deduplicateInteractiveFilter(callback),
		{signal, capture},
	);
}

export function onConversationTitleFieldKeydown(callback: KeydownHandler, signal: AbortSignal): void {
	delegate<TextField, 'keydown'>(
		[
			'[class^="prc-PageLayout-Header"] input', // PR
			'input[placeholder="Title"]', // Issue
			"input[name='pull_request[title]']", // Compare
		],
		'keydown',
		deduplicateInteractiveFilter(callback),
		{signal, capture},
	);
}

export function onCommitTitleFieldKeydown(callback: KeydownHandler, signal: AbortSignal): void {
	delegate<TextField, 'keydown'>(
		'#commit-message-input', // `isEditingFile`, `isNewFile`
		'keydown',
		deduplicateInteractiveFilter(callback),
		{signal, capture},
	);
}
