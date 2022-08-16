import * as pageDetect from 'github-url-detection';
import * as textFieldEdit from 'text-field-edit';
import delegate, {DelegateEvent} from 'delegate-it';

import features from '.';
import {onCommentFieldKeydown, onConversationTitleFieldKeydown, onCommitTitleFieldKeydown} from '../github-events/on-field-keydown';

const formattingCharacters = ['`', '\'', '"', '[', '(', '{', '*', '_', '~', '“', '‘'];
const matchingCharacters = ['`', '\'', '"', ']', ')', '}', '*', '_', '~', '”', '’'];

function eventHandler(event: DelegateEvent<KeyboardEvent, HTMLTextAreaElement | HTMLInputElement>): void {
	const field = event.delegateTarget;

	if (!formattingCharacters.includes(event.key)) {
		return;
	}

	const [start, end] = [field.selectionStart, field.selectionEnd];

	// If `start` and `end` of selection are the same, then no text is selected
	if (start === end) {
		return;
	}

	event.preventDefault();

	const formattingChar = event.key;
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
