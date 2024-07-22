import * as pageDetect from 'github-url-detection';
import {eventHandler} from 'indent-textarea';

import features from '../feature-manager.js';
import {onCommentFieldKeydown} from '../github-events/on-field-keydown.js';

function init(signal: AbortSignal): void {
	onCommentFieldKeydown(eventHandler, signal);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRichTextEditor,
	],
	init,
});
