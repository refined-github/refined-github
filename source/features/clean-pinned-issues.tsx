import './clean-pinned-issues.css';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	document.body.classList.add('rgh-clean-pinned-issue');
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepoIssueList
	],
	init
});
