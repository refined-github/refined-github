import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';

function onKeyDownEnter(event: delegate.Event<KeyboardEvent, HTMLFormElement>): void {
	if (event.key === 'Enter' && !event.ctrlKey) {
		event.preventDefault();
		select('#issue_body, #pull_request_body, #commit-description-textarea', event.delegateTarget.form)!.focus();
	}
}

// Add ability to submit via Ctrl+Enter in isNewFile and isEditingFile pages (was not available before)
function onKeyDownCtrlEnter(event: delegate.Event<KeyboardEvent, HTMLFormElement>): void {
	if (event.key === 'Enter' && event.ctrlKey) {
		event.delegateTarget.form.submit();
	}
}

function init(): void {
	delegate(document, 'input#issue_title, input#pull_request_title, input#commit-summary-input', 'keydown', onKeyDownEnter);
	delegate(document, 'input#commit-summary-input', 'keydown', onKeyDownCtrlEnter);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isNewIssue,
		() => pageDetect.isCompare() && select.exists('#new_pull_request'),
		pageDetect.isNewFile,
		pageDetect.isEditingFile
	],
	init
});
