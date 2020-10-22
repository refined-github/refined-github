import './align-issue-labels.css';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	document.body.classList.add('rgh-align-issue-labels');
}

void features.add(__filebasename, {}, {
	awaitDomReady: false,
	include: [
		pageDetect.isConversationList
	],
	init
});
