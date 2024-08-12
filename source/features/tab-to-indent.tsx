import {eventHandler} from 'indent-textarea';
import * as pageDetect from 'github-url-detection';

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

/*

Test URLs:

https://github.com/refined-github/refined-github/issues/new?template=1_bug_report.yml
https://github.com/refined-github/refined-github/pull/6002

*/
