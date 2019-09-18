import indentTextarea from 'indent-textarea';
import {DelegateEvent} from 'delegate-it';
import features from '../libs/features';
import {listenToCommentFields} from './comment-fields-keyboard-shortcuts';

function handler(event: DelegateEvent<KeyboardEvent, HTMLTextAreaElement>): void {
	const field = event.delegateTarget;
	if (event.key === 'Tab' && !event.shiftKey) {
		indentTextarea(field);
		event.preventDefault();
	}
}

function init(): void {
	listenToCommentFields(handler);
}

features.add({
	id: __featureName__,
	description: 'Enables the <kbd>tab</kbd> key for indentation in comment fields.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/33802977-beb8497c-ddbf-11e7-899c-698d89298de4.gif',
	init
});
