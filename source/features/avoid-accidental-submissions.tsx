import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';

function onKeyDown(event: delegate.Event<KeyboardEvent, HTMLFormElement>): void {
	if (event.key === 'Enter') {
		event.preventDefault();
		select('textarea', event.delegateTarget.form)!.focus();
	}
}

function init(): void {
	delegate(document, 'input#issue_title, input#pull_request_title, input#commit-summary-input', 'keydown', onKeyDown);
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
