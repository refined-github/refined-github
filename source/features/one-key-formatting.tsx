import delegate from 'delegate-it';
import * as textFieldEdit from 'text-field-edit';
import features from '../libs/features';
import {listenToCommentFields} from './comment-fields-keyboard-shortcuts';

const formattingCharacters = ['`', '\'', '"', '[', '(', '{', '*', '_', '~'];
const matchingCharacters = ['`', '\'', '"', ']', ')', '}', '*', '_', '~'];

function handler(event: delegate.Event<KeyboardEvent, HTMLTextAreaElement>): void {
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
	listenToCommentFields(handler);
}

features.add({
	id: __filebasename,
	description: 'Wraps selected text when pressing one of Markdown symbols instead of replacing it: (`[` `’` `"` `(` etc).',
	screenshot: 'https://user-images.githubusercontent.com/1402241/65020298-1f2dfb00-d957-11e9-9a2a-1c0ceab8d9e0.gif'
}, {
	waitForDomReady: false,
	repeatOnAjax: false,
	init
});
