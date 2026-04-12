import './conversation-authors.css';

import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import {getLoggedInUser} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';

function highlightSelf(signal: AbortSignal): void {
	// "Opened by {user}" and "Created by {user}"
	observe([
		// Old issue lists - TODO: Drop in 2026
		`.opened-by a[title$="ed by ${CSS.escape(getLoggedInUser()!)}"]`,
		`a[class^="IssueItem-module__authorCreatedLink"][data-hovercard-url="/users/${CSS.escape(getLoggedInUser()!)}/hovercard"]`,
	], author => {
		author.classList.add('rgh-own-conversation');
	}, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isIssueOrPRList,
	],
	init: highlightSelf,
});

/*

Test URLs:

https://github.com/issues
https://github.com/refined-github/refined-github/pulls

*/
