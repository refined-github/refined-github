import onetime from 'onetime';
import {eventHandler} from 'indent-textarea';
import * as pageDetect from 'github-url-detection';

import features from '.';
import onCommentFieldKeydown from '../github-events/on-comment-field-keydown';

function init(): void {
	onCommentFieldKeydown(eventHandler);
}

void features.add({
	id: __filebasename,
	description: 'Enables `tab` and `shift` `tab` for indentation in comment fields.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/33802977-beb8497c-ddbf-11e7-899c-698d89298de4.gif'
}, {
	include: [
		pageDetect.hasRichTextEditor
	],
	awaitDomReady: false,
	init: onetime(init)
});
