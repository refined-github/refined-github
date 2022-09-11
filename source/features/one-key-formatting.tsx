import * as pageDetect from 'github-url-detection';
import * as textFieldEdit from 'text-field-edit';
import delegate, {DelegateEvent} from 'delegate-it';

import features from '.';
import {onCommentFieldKeydown, onConversationTitleFieldKeydown, onCommitTitleFieldKeydown} from '../github-events/on-field-keydown';

const formattingCharacters = ['`', '\'', '"', '[', '(', '{', '*', '_', '~', '“', '‘'];
const matchingCharacters = ['`', '\'', '"', ']', ')', '}', '*', '_', '~', '”', '’'];
const quoteCharacters = new Set(['`', '\'', '"']);

function eventHandler(event: DelegateEvent<KeyboardEvent, HTMLTextAreaElement | HTMLInputElement>): void {
	const field = event.delegateTarget;
	const formattingChar = event.key;

	if (!formattingCharacters.includes(formattingChar)) {
		return;
	}

	const [start, end] = [field.selectionStart, field.selectionEnd];

	// If `start` and `end` of selection are the same, then no text is selected
	if (start === end || start === null || end === null) {
		return;
	}

	const selectedText = field.value.slice(start, end);

	// Allow replacing quotes
	if (quoteCharacters.has(formattingChar) && quoteCharacters.has(selectedText)) {
		return;
	}

	event.preventDefault();

	const matchingEndChar = matchingCharacters[formattingCharacters.indexOf(formattingChar)];
	textFieldEdit.wrapSelection(field, formattingChar, matchingEndChar);
}

function init(signal: AbortSignal): void {
	onCommentFieldKeydown(eventHandler, signal);
	onConversationTitleFieldKeydown(eventHandler, signal);
	onCommitTitleFieldKeydown(eventHandler, signal);
	delegate(document, 'input[name="commit_title"], input[name="gist[description]"], #saved-reply-title-field', 'keydown', eventHandler, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRichTextEditor,
		pageDetect.isGist,
		pageDetect.isNewFile,
		pageDetect.isEditingFile,
		pageDetect.isDeletingFile,
	],
	awaitDomReady: false,
	deduplicate: false,
	init,
});
