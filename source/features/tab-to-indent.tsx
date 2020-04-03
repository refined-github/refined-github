import {eventHandler} from 'indent-textarea';
import features from '../libs/features';
import {listenToCommentFields} from './comment-fields-keyboard-shortcuts';

function init(): void {
	listenToCommentFields(eventHandler);
}

features.add({
	id: __featureName__,
	description: 'Enables <kbd>tab</kbd> and <kbd>shift+tab</kbd> for indentation in comment fields.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/33802977-beb8497c-ddbf-11e7-899c-698d89298de4.gif'
}, {
	load: features.onDocumentStart,
	init
});
