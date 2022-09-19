import {eventHandler} from 'indent-textarea';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import {onCommentFieldKeydown} from '../github-events/on-field-keydown';

function init(signal: AbortSignal): void {
	onCommentFieldKeydown(eventHandler, signal);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRichTextEditor,
	],
	awaitDomReady: false,
	deduplicate: 'has-rgh-inner',
	init,
});
