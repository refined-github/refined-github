import './clean-pinned-issues.css';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	const pinned_issues_container = select('.js-pinned-issues-reorder-container');
	if (pinned_issues_container) {
		pinned_issues_container.classList.add('clean-pinned-issue');
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepoIssueList
	],
	init
});
