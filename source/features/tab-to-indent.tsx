import {eventHandler} from 'indent-textarea';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {onCommentFieldKeydown} from '../github-events/on-field-keydown';

function init(): Deinit {
	return onCommentFieldKeydown(eventHandler);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRichTextEditor,
	],
	awaitDomReady: false,
	deduplicate: 'has-rgh-inner',
	init,
});
