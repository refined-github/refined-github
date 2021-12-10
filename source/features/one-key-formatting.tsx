import onetime from 'onetime';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import * as textFieldEdit from 'text-field-edit';

import features from '.';
import {onCommentFieldKeydown, onConversationTitleFieldKeydown, onCommitTitleFieldKeydown} from '../github-events/on-field-keydown.js';

const formattingCharacters = ['`', '\'', '"', '[', '(', '{', '*', '_', '~', '“', '‘'];
const matchingCharacters = ['`', '\'', '"', ']', ')', '}', '*', '_', '~', '”', '’'];

function eventHandler(event: delegate.Event<KeyboardEvent, HTMLTextAreaElement | HTMLInputElement>): void {
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

function init(): void {
	onCommentFieldKeydown(eventHandler);
	onConversationTitleFieldKeydown(eventHandler);
	onCommitTitleFieldKeydown(eventHandler);
	delegate(document, 'input[name="commit_title"], input[name="gist[description]"], #saved-reply-title-field', 'keydown', eventHandler);
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
	deduplicate: 'has-rgh-inner',
	init: onetime(init),
});
