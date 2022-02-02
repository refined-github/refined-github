import './hide-low-quality-comments.css';
import delay from 'delay';
import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';
import isLowQualityComment from '../helpers/is-low-quality-comment';

async function unhide(event: delegate.Event): Promise<void> {
	for (const comment of select.all('.rgh-hidden-comment')) {
		comment.hidden = false;
	}

	await delay(10); // "Similar comments" aren't expanded without this in Safari #3830

	// Expand all "similar comments" boxes
	for (const similarCommentsExpandButton of select.all('.rgh-hidden-comment > summary')) {
		similarCommentsExpandButton.click();
	}

	select('.rgh-hidden-comment')!.scrollIntoView();
	event.delegateTarget.parentElement!.remove();
}

function hideComment(comment: HTMLElement): void {
	comment.hidden = true;
	comment.classList.add('rgh-hidden-comment');
}

function init(): void {
	let lowQualityCount = 0;

	for (const similarCommentsBox of select.all('.js-discussion .Details-element:not([data-body-version])')) {
		hideComment(similarCommentsBox);
		lowQualityCount++;
	}

	const notLinkedCommentSelector = window.location.hash.startsWith('#issuecomment-')
		? `.timeline-comment-group:not(${window.location.hash}) .comment-body > p:only-child`
		: '.comment-body > p:only-child';

	for (const commentText of select.all(notLinkedCommentSelector)) {
		if (!isLowQualityComment(commentText.textContent!)) {
			continue;
		}

		// Comments that contain useful images shouldn't be removed
		if (select.exists('a img', commentText)) {
			continue;
		}

		// Ensure that they're not by VIPs (owner, collaborators, etc)
		const comment = commentText.closest('.js-timeline-item')!;
		if (select.exists('.timeline-comment-label', comment)) {
			continue;
		}

		// If the person is having a conversation, then don't hide it
		const author = select('.author', comment)!.getAttribute('href')!;
		// If the first comment left by the author isn't a low quality comment
		// (previously hidden or about to be hidden), then leave this one as well
		const previousComment = select(`.js-timeline-item:not([hidden]) .unminimized-comment .author[href="${author}"]`);
		if (previousComment?.closest('.js-timeline-item') !== comment) {
			continue;
		}

		hideComment(comment);
		lowQualityCount++;
	}

	if (lowQualityCount > 0) {
		select('.discussion-timeline-actions')!.prepend(
			<p className="rgh-low-quality-comments-note">
				{`${lowQualityCount} unhelpful comment${lowQualityCount > 1 ? 's were' : ' was'} automatically hidden. `}
				<button className="btn-link text-emphasized rgh-unhide-low-quality-comments" type="button">Show</button>
			</p>,
		);
		delegate(document, '.rgh-unhide-low-quality-comments', 'click', unhide);
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isIssue,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
