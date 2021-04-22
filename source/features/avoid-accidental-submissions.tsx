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

function init(): void {
	delegate(document, 'input#issue_title, input#pull_request_title, input#commit-summary-input', 'keydown', onKeyDownEnter);
}

function addQuickSubmit(): void {
	select('input#commit-summary-input')?.classList.add('js-quick-submit');
}

void features.add(__filebasename, {
	include: [
		pageDetect.isNewIssue,
		() => pageDetect.isCompare() && select.exists('#new_pull_request'),
		pageDetect.isNewFile,
		pageDetect.isEditingFile
	],
	init
}, {
	include: [
		pageDetect.isNewFile,
		pageDetect.isEditingFile
	],
	init: addQuickSubmit
});
