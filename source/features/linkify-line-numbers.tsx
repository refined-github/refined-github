import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import linkifyLineNumber from '../helpers/linkify-line-number.js';
import observe from '../helpers/selector-observer.js';

function init(signal: AbortSignal): void {
	observe('.blob-num:not(.blob-num-hunk, .empty-cell)', linkifyLineNumber, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isConversation,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/sandbox/pull/81

*/
