// import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';


// function handleComment() {
function handleComment(event: delegate.Event<MouseEvent, KeyboardEvent, HTMLAnchorElement>): void {
    let body = document.querySelector('textarea[name="comment[body]"]').value.length;
    if (body < 3 && !confirm('Body too short, sure?')) {
        event.preventDefault();
		event.stopImmediatePropagation(); // I don't know if it's necessary to stop comments, they're sent via ajax
	}
}


// function handleNewConversation() {
function handleNewConversation(event: delegate.Event<MouseEvent, KeyboardEvent, HTMLAnchorElement>): void {    
    let body = document.querySelector('textarea#issue_body').value.length;
    let title = document.querySelector('input#issue_title').value.length;
	if ((body < 3 || title < 3) && !confirm('Body too short, sure?') ) {
		event.preventDefault();
	}
}

function init(): void {

	const formComment = 'form.js-new-comment-form';
	const formNewIssue = 'form.new_issue';
	
	if (pageDetect.isIssue()){
		document.querySelector(formComment).addEventListener('submit', handleComment );
	} else if (pageDetect.isNewIssue()){
		document.querySelector(formNewIssue).addEventListener('submit', handleNewConversation);
	}

}

void features.add(__filebasename, {
    awaitDomReady: false,
	include: [
		pageDetect.isNewIssue, // Find which one you need on https://fregante.github.io/github-url-detection/
		pageDetect.isIssue
	],
	init
});
