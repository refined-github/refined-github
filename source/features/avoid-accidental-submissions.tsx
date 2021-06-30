import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';

function addQuickSubmit(): void {
	select('input#commit-summary-input')!.classList.add('js-quick-submit');
}

function onKeyDown(event: delegate.Event<KeyboardEvent, HTMLInputElement>): void {
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
	select([
		'#issue_body',
		'#pull_request_body',
		'#commit-description-textarea',
		'#merge_message_field'
	], event.delegateTarget.form!)!.focus();
}

function init(): void {
	const elementsToDelegateKeydown = [
		'input#pull_request_title',
		'input#commit-summary-input',
		'#merge_title_field'
	];

	if (!pageDetect.isPRConversation()) { // In all cases other than isPRConversation, disallow title edit via Enter
		elementsToDelegateKeydown.push('input#issue_title');
	}

	delegate(document, elementsToDelegateKeydown.join(), 'keydown', onKeyDown);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isNewIssue,
		pageDetect.isCompare,
		pageDetect.isNewFile,
		pageDetect.isEditingFile,
		pageDetect.isPRConversation
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
