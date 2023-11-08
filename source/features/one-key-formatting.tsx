import * as pageDetect from 'github-url-detection';
import {wrapFieldSelection} from 'text-field-edit';
import delegate, {DelegateEvent} from 'delegate-it';

import features from '../feature-manager.js';
import {onCommentFieldKeydown, onConversationTitleFieldKeydown, onCommitTitleFieldKeydown} from '../github-events/on-field-keydown.js';

const formattingCharacters = ['`', '\'', '"', '[', '(', '{', '*', '_', '~', '“', '‘'];
const matchingCharacters = ['`', '\'', '"', ']', ')', '}', '*', '_', '~', '”', '’'];
const quoteCharacters = new Set(['`', '\'', '"']);

function eventHandler(event: DelegateEvent<KeyboardEvent, HTMLTextAreaElement | HTMLInputElement>): void {
	const field = event.delegateTarget;
	const formattingChar = event.key;

	if (!formattingCharacters.includes(formattingChar)) {
		return;
	}

	const [start, end] = [field.selectionStart!, field.selectionEnd!];

	// If `start` and `end` of selection are the same, then no text is selected
	if (start === end) {
		return;
	}

	// Allow replacing quotes #5960
	if (quoteCharacters.has(formattingChar) && end - start === 1 && quoteCharacters.has(field.value.at(start)!)) {
		return;
	}

	event.preventDefault();

	const matchingEndChar = matchingCharacters[formattingCharacters.indexOf(formattingChar)];
	wrapFieldSelection(field, formattingChar, matchingEndChar);
}

function init(signal: AbortSignal): void {
	onCommentFieldKeydown(eventHandler, signal);
	onConversationTitleFieldKeydown(eventHandler, signal);
	onCommitTitleFieldKeydown(eventHandler, signal);
	delegate('input[name="commit_title"], input[name="gist[description]"], #saved-reply-title-field', 'keydown', eventHandler, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRichTextEditor,
		pageDetect.isGist,
		pageDetect.isNewFile,
		pageDetect.isEditingFile,
		pageDetect.isDeletingFile,
	],
	init,
});
