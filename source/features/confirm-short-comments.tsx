import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';

function handleIssueComment(event: delegate.Event<MouseEvent, KeyboardEvent, HTMLAnchorElement>): void {
	const textareas = select('textarea[name="comment[body]"], textarea#issue_body')!.value.length;
	const title = select('form.new_issue input#issue_title')?.value.length;
	
	let message = '';
	if ( (title && title < 3) && (textareas < 3)) {
		message = 'Body, title are';
	} else if (title && title < 3) {
		message = message + 'Title is';
	} else if (textareas < 3) {
		message = message + 'Body is';
	}
	message = message + ' less than 3 characters, are you sure?';

	if ( ( (title && title < 3) || (textareas < 3) ) && !confirm(message) ) {
		event.preventDefault(); 

		if ( (textareas < 3 ) && pageDetect.isIssue() ) {
			event.stopImmediatePropagation();
		} 

		const element = document.activeElement;
		element?.blur();
		element?.focus();
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
