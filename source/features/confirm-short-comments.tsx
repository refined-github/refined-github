import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';


function handleIssueComment(event: delegate.Event<MouseEvent, KeyboardEvent, HTMLAnchorElement>): void {
	const textareas = select('textarea[name="comment[body]"], textarea#issue_body')!.value.length;
	const title = select('input#issue_title')?.value.length;
	if ( (textareas && textareas < 3) && !confirm('Body is less than 3 characters, are you sure?') ) {
		event.preventDefault();
		event.stopImmediatePropagation();
	}

	if ( pageDetect.isNewIssue() && (title && title < 3) && !confirm('Title is less than 3 characters, are you sure?') ) {
		event.preventDefault();
	}

}

function init(): void {
	delegate(document, 'form.js-new-comment-form, form.new_issue', 'submit', handleIssueComment)
}

void features.add(__filebasename, {
	include: [
		pageDetect.isNewIssue,
		pageDetect.isIssue
	],
	awaitDomReady: false,
	init
});
