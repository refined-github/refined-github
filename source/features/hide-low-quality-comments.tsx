import './hide-low-quality-comments.css';

import React from 'dom-chef';
import {$, $optional} from 'select-dom/strict.js';
import {$$, countElements, elementExists} from 'select-dom';
import * as pageDetect from 'github-url-detection';
import delegate, {type DelegateEvent} from 'delegate-it';

import delay from '../helpers/delay.js';
import features from '../feature-manager.js';
import isLowQualityComment from '../helpers/is-low-quality-comment.js';

export const singleParagraphCommentSelector = '.react-issue-comment [class*="NewMarkdownViewer-module__safe-html-box"] > p:only-child';

async function unhide(event: DelegateEvent): Promise<void> {
	for (const comment of $$('.rgh-hidden-comment')) {
		comment.hidden = false;
	}

	$('.rgh-hidden-comment').scrollIntoView();
	event.delegateTarget.parentElement!.remove();
}

function hideComment(comment: HTMLElement): void {
	comment.hidden = true;
	comment.classList.add('rgh-hidden-comment');
}

async function init(): Promise<void> {
	await delay(1500) // Am I allowed to swear in code comments

	const linkedComment = location.hash.startsWith('#issuecomment-')
		? $optional(`${location.hash} ${singleParagraphCommentSelector}`)
		: undefined;

	for (const commentText of $$(singleParagraphCommentSelector)) {
		// Exclude explicitly linked comments #5363
		if (commentText === linkedComment) {
			continue;
		}

		if (!isLowQualityComment(commentText.textContent)) {
			continue;
		}

		// Comments that contain useful images or links shouldn't be removed
		// Images are wrapped in <a> tags on GitHub hence included in the selector
		if (elementExists('a', commentText)) {
			continue;
		}

		// Ensure that they're not by VIPs (owner, collaborators, etc)
		const comment = commentText.closest('[data-wrapper-timeline-id]')!;
		if (elementExists('[class^="ActivityHeader-module__BadgesGroupContainer"] > *', comment)) {
			continue;
		}

		// If the person is having a conversation, then don't hide it
		const author = $('[class*="ActivityHeader-module__AuthorLink"]', comment).getAttribute('href')!;
		// If the first comment left by the author isn't a low quality comment
		// (previously hidden or about to be hidden), then leave this one as well
		const previousComment = $(`[data-wrapper-timeline-id]:not(:has(.octicon-unfold)):has([class*="ActivityHeader-module__AuthorLink"][href="${author}"])`);
		if (previousComment !== comment) {
			continue;
		}

		hideComment(comment);
	}

	const lowQualityCount = countElements('.rgh-hidden-comment');
	if (lowQualityCount > 0) {
		$('#react-issue-comment-composer').prepend(
			<p className="rgh-low-quality-comments-note">
				{`${lowQualityCount} unhelpful comment${lowQualityCount > 1 ? 's were' : ' was'} automatically hidden. `}
				<button className="btn-link text-emphasized rgh-unhide-low-quality-comments" type="button">Show</button>
			</p>,
		);

		// No need to add the signal here
		delegate('.rgh-unhide-low-quality-comments', 'click', unhide);
	}
}

// This should NOT be made dynamic via observer, it's not worth updating the lowQuality count for fresh comments
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

- 26 hidden comments: https://togithub.com/stephencookdev/speed-measure-webpack-plugin/issues/167#issue-849740710
- Linked comment should not be collapsed: https://togithub.com/stephencookdev/speed-measure-webpack-plugin/issues/167#issuecomment-821212185

*/
