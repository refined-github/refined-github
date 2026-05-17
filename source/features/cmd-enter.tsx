import delegate, {type DelegateEvent} from 'delegate-it';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {$, $optional, elementExists} from 'select-dom';

import features from '../feature-manager.js';
import {moduleKeySymbol} from '../github-helpers/hotkey.js';
import {legacyCommentField} from '../github-helpers/selectors.js';
import observe from '../helpers/selector-observer.js';

function addShortcut(reopenButton: HTMLButtonElement): void {
	const submitButton = $('.btn-primary[type="submit"]', reopenButton.form!);
	if (elementExists('.rgh-cmd-enter-shortcut', submitButton)) {
		return;
	}

	submitButton.append(
		' ',
		<span className="rgh-cmd-enter-shortcut text-normal" aria-hidden="true">
			{moduleKeySymbol}
			↵
		</span>,
	);
}

function handleKeyDown(event: DelegateEvent<KeyboardEvent>): void {
	if (event.key !== 'Enter' || !(event.metaKey || event.ctrlKey)) {
		return;
	}

	const reopenButton = $optional('button[name="comment_and_open"]:disabled');
	if (!reopenButton) {
		return;
	}

	$('.btn-primary[type="submit"]', reopenButton.form!).click();
	event.preventDefault();
}

function init(signal: AbortSignal): void {
	observe('button[name="comment_and_open"]:disabled', addShortcut, {signal});
	delegate(legacyCommentField, 'keydown', handleKeyDown, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRConversation,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/sandbox/pull/22

*/
