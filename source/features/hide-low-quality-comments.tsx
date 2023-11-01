import './hide-low-quality-comments.css';
import delay from 'delay';
import React from 'dom-chef';
import {$, $$, elementExists} from 'select-dom';
import * as pageDetect from 'github-url-detection';
import delegate, {DelegateEvent} from 'delegate-it';

import features from '../feature-manager.js';
import isLowQualityComment from '../helpers/is-low-quality-comment.js';

export const singleParagraphCommentSelector = '.comment-body > p:only-child';

async function unhide(event: DelegateEvent): Promise<void> {
	for (const comment of $$('.rgh-hidden-comment')) {
		comment.hidden = false;
	}

	await delay(10); // "Similar comments" aren't expanded without this in Safari #3830

	// Expand all "similar comments" boxes
	for (const similarCommentsExpandButton of $$('.rgh-hidden-comment > summary')) {
		similarCommentsExpandButton.click();
	}

	$('.rgh-hidden-comment')!.scrollIntoView();
	event.delegateTarget.parentElement!.remove();
}

function hideComment(comment: HTMLElement): void {
	comment.hidden = true;
	comment.classList.add('rgh-hidden-comment');
}

function init(): void {
	for (const similarCommentsBox of $$('.js-discussion .Details-element:not([data-body-version])')) {
		hideComment(similarCommentsBox);
	}

	const linkedComment = location.hash.startsWith('#issuecomment-') ? $(`${location.hash} ${singleParagraphCommentSelector}`) : undefined;

	for (const commentText of $$(singleParagraphCommentSelector)) {
		// Exclude explicitely linked comments #5363
		if (commentText === linkedComment) {
			continue;
		}

		if (!isLowQualityComment(commentText.textContent)) {
			continue;
		}

		// Comments that contain useful images or links shouldn't be removed
		// Images are wrapped in <a> tags on GitHub hence included in the selector
		// TODO: use :has()
		if (elementExists('a', commentText)) {
			continue;
		}

		// Ensure that they're not by VIPs (owner, collaborators, etc)
		// TODO: use :has()
		const comment = commentText.closest('.js-timeline-item')!;
		if (elementExists('.Label', comment)) {
			continue;
		}

		// If the person is having a conversation, then don't hide it
		const author = $('.author', comment)!.getAttribute('href')!;
		// If the first comment left by the author isn't a low quality comment
		// (previously hidden or about to be hidden), then leave this one as well
		const previousComment = $(`.js-timeline-item:not([hidden]) .unminimized-comment .author[href="${author}"]`);
		if (previousComment?.closest('.js-timeline-item') !== comment) {
			continue;
		}

		hideComment(comment);
	}

	const lowQualityCount = $$('.rgh-hidden-comment').length;
	if (lowQualityCount > 0) {
		$('.discussion-timeline-actions')!.prepend(
			<p className="rgh-low-quality-comments-note">
				{`${lowQualityCount} unhelpful comment${lowQualityCount > 1 ? 's were' : ' was'} automatically hidden. `}
				<button className="btn-link text-emphasized rgh-unhide-low-quality-comments" type="button">Show</button>
			</p>,
		);

		// No need to add the signal here
		delegate('.rgh-unhide-low-quality-comments', 'click', unhide);
	}
}

// This should not be made dynamic via observer, it's not worth updating the lowQuality count for fresh comments
void features.add(import.meta.url, {
	include: [
		pageDetect.isIssue,
	],
	deduplicate: '.rgh-low-quality-comments-note',
	awaitDomReady: true,
	init,
});

/*
## Test URLs
https://github.com/facebook/jest/issues/5311
*/
