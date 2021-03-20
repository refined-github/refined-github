import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import * as textFieldEdit from 'text-field-edit';

import features from '.';

function refocus(): void {
	const element = document.activeElement;
	const value = element?.value;
	textFieldEdit.set(
		element,
		value
	);
}

function handleIssueComment(event: delegate.Event<MouseEvent, KeyboardEvent, HTMLAnchorElement>): void {
	const textareas = select('textarea[name="comment[body]"], textarea#issue_body')!.value.length;
	const title = select('form.new_issue input#issue_title')?.value.length;

	let message = '';
	if ((title && title < 3) && (textareas < 3)) {
		message = 'Body, title are';
	} else if (title && title < 3) {
		message += 'Title is';
	} else if (textareas < 3) {
		message += 'Body is';
	}

	message += ' less than 3 characters, are you sure?';

	if ((title && title < 3) && !confirm(message)) {
		event.preventDefault();
		refocus();
		return;
	}

	if ((textareas < 3) && !confirm(message)) {
		event.preventDefault();
		if (pageDetect.isIssue()) {
			event.stopImmediatePropagation();
		}

		refocus();
	}
}

function init(): void {
	delegate(document, 'form.js-new-comment-form, form.new_issue', 'submit', handleIssueComment);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isNewIssue,
		pageDetect.isIssue
	],
	awaitDomReady: false,
	init
});
