import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';

function addQuickSubmit(): void {
	select('input#commit-summary-input')!.classList.add('js-quick-submit');
}

function onKeyDown(event: delegate.Event<KeyboardEvent, HTMLInputElement>): void {
	// The suggester is GitHub’s autocomplete dropdown
	if (
		event.key !== 'Enter' ||
		event.ctrlKey ||
		event.metaKey ||
		event.isComposing || // #4323
		select.exists('.suggester', event.delegateTarget.form!) // GitHub’s autocomplete dropdown
	) {
		return;
	}

	event.preventDefault();
	select('#issue_body, #pull_request_body, #commit-description-textarea', event.delegateTarget.form!)!.focus();
}

function init(): void {
	delegate(document, 'input#issue_title, input#pull_request_title, input#commit-summary-input', 'keydown', onKeyDown);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isNewIssue,
		pageDetect.isCompare,
		pageDetect.isNewFile,
		pageDetect.isEditingFile
	],
	init
}, {
	shortcuts: {
		'ctrl enter': 'Publish a new/edited file'
	},
	include: [
		pageDetect.isNewFile,
		pageDetect.isEditingFile
	],
	init: addQuickSubmit
});
