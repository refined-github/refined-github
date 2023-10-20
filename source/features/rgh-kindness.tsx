import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

function updateCommentField(field: HTMLTextAreaElement): void {
	field.placeholder += ', be kind';
}

function init(signal: AbortSignal): void {
	observe('textarea[placeholder="Leave a comment"]', updateCommentField, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasComments,
	],
	init,
});
