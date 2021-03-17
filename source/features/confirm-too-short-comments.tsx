// import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';


function handleIssueComment(event: delegate.Event<MouseEvent, KeyboardEvent, HTMLAnchorElement>): void {
    let body = document.querySelector('textarea[name="comment[body]"], textarea#issue_body')?.value.length;
	let title = document.querySelector('input#issue_title')?.value.length;
	if ( ((body && body < 3) || (title && title < 3)) && !confirm('Less than 3 chrs, are you sure?') ) {
			event.preventDefault();
			event.stopImmediatePropagation();
	}
}

function init(): void {

	const formComment = 'form.js-new-comment-form';
	const formNewIssue = 'form.new_issue';
	
	if (pageDetect.isIssue()){
		document.querySelector(formComment)?.addEventListener('submit', handleIssueComment );
	} else if (pageDetect.isNewIssue()){
		document.querySelector(formNewIssue)?.addEventListener('submit', handleIssueComment );
	}

}

void features.add(__filebasename, {
    awaitDomReady: false,
	include: [
		pageDetect.isNewIssue,
		pageDetect.isIssue
	],
	init
});
