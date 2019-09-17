import insertText from 'insert-text-textarea';
import {DelegateEvent} from 'delegate-it';
import features from '../libs/features';
import {listenToCommentFields} from './comment-fields-keyboard-shortcuts';

const formattingCharacters = ['`', '\'', '"', '[', '(', '{', '*', '_', '~'];
const matchingCharacters = ['`', '\'', '"', ']', ')', '}', '*', '_', '~'];

function handler(event: DelegateEvent<KeyboardEvent, HTMLTextAreaElement>): void {
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
	const selectedText = field.value.slice(start, end);
	const matchingEndChar = matchingCharacters[formattingCharacters.indexOf(formattingChar)];
	insertText(field, formattingChar + selectedText + matchingEndChar);

	// Keep the selection as it is, to be able to chain shortcuts
	field.setSelectionRange(start + 1, end + 1);
}

function init(): void {
	listenToCommentFields(handler);
}

features.add({
	id: __featureName__,
	description: 'Wraps selected text when pressing one of Markdown symbols instead of replacing it: (`[` `’` `"` `(` etc).',
	screenshot: 'https://user-images.githubusercontent.com/1402241/65020298-1f2dfb00-d957-11e9-9a2a-1c0ceab8d9e0.gif',
	init
});
