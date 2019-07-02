import './hide-discussion-noise.css';
import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import {isIssue} from '../libs/page-detect';

function hideComments(): number {
	let hiddenCommentsCount = 0;
	for (const commentText of select.all('.comment-body > p:only-child')) {
		// Find useless comments
		if (!/^([+-]\d+!*|👍|🙏|👎|👌|)+$/.test(commentText.textContent!.trim())) {
			continue;
		}

		// Comments that contain useful images shouldn't be removed
		if (select.exists('a img', commentText)) {
			continue;
		}

		// Ensure that they're not by VIPs (owner, collaborators, etc)
		const comment = commentText.closest('.js-timeline-item') as HTMLElement;
		if (select.exists('.timeline-comment-label', comment)) {
			continue;
		}

		// If the person is having a conversation, then don't hide it
		const author = select('.author', comment)!.getAttribute('href');
		// If the first comment left by the author isn't a useless comment
		// (previously hidden or about to be hidden), then leave this one as well
		const previousComment = select(`.js-timeline-item:not([hidden]) .unminimized-comment .author[href="${author}"]`);
		if (previousComment && previousComment.closest('.js-timeline-item') !== comment) {
			continue;
		}

		comment.hidden = true;
		comment.classList.add('rgh-hidden-comment');
		hiddenCommentsCount++;
	}

	return hiddenCommentsCount;
}

function init(): void {
	// Only hide comments in issues #1543
	const hiddenCommentsCount = isIssue() ? hideComments() : 0;
	if (hiddenCommentsCount > 0) {
		select('.discussion-timeline-actions')!.prepend(
			<p className="rgh-noisy-discussion-note">
				{`${hiddenCommentsCount} unhelpful comment${hiddenCommentsCount > 1 ? 's were' : ' was'} automatically hidden. `}
				<button className="btn-link text-emphasized" onClick={unhide}>Show</button>
			</p>
		);
	}
}

function unhide(event: React.MouseEvent<HTMLButtonElement>): void {
	for (const comment of select.all('.rgh-hidden-comment')) {
		comment.hidden = false;
	}

	select('.rgh-hidden-comment')!.scrollIntoView();
	event.currentTarget.parentElement!.remove();
}

features.add({
	id: __featureName__,
	description: 'Hide useless comments like "+1"',
	include: [
		features.isIssue,
		features.isPRConversation
	],
	load: features.onAjaxedPages,
	init
});
