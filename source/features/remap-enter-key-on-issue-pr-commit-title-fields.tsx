import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';

void features.addCssFeature(__filebasename, [pageDetect.isDashboard]);

function init(): void {
	delegate(document, '#issue_title, #pull_request_title, #commit-summary-input', 'keypress', event => {
		if (event.key === 'Enter') {
			event.preventDefault();
			select('textarea', (event.delegateTarget as HTMLFormElement).form)!.focus();
		}
	});
}

void features.add(__filebasename, {

	include: [
		pageDetect.isNewIssue,
		pageDetect.isCompare,
		pageDetect.isRepo,
		pageDetect.isEditingFile
	],
	awaitDomReady: false,
	init
});
