import './hide-useless-comments.css';
import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';

function init(): void {
	let uselessCount = 0;
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
		const comment = commentText.closest<HTMLElement>('.js-timeline-item')!;
		if (select.exists('.timeline-comment-label', comment)) {
			continue;
		}

		// If the person is having a conversation, then don't hide it
		const author = select('.author', comment)!.getAttribute('href')!;
		// If the first comment left by the author isn't a useless comment
		// (previously hidden or about to be hidden), then leave this one as well
		const previousComment = select(`.js-timeline-item:not([hidden]) .unminimized-comment .author[href="${author}"]`);
		if (previousComment?.closest('.js-timeline-item') !== comment) {
			continue;
		}

		comment.hidden = true;
		comment.classList.add('rgh-hidden-comment');
		uselessCount++;
	}

	if (uselessCount > 0) {
		select('.discussion-timeline-actions')!.prepend(
			<p className="rgh-useless-comments-note">
				{`${uselessCount} unhelpful comment${uselessCount > 1 ? 's were' : ' was'} automatically hidden. `}
				<button className="btn-link text-emphasized rgh-unhide-useless-comments" type="button">Show</button>
			</p>
		);
		delegate(document, '.rgh-unhide-useless-comments', 'click', unhide);
	}
}

function unhide(event: delegate.Event<MouseEvent, HTMLButtonElement>): void {
	for (const comment of select.all('.rgh-hidden-comment')) {
		comment.hidden = false;
	}

	select('.rgh-hidden-comment')!.scrollIntoView();
	event.delegateTarget.parentElement!.remove();
}

features.add({
	id: __filebasename,
	description: 'Hides reaction comments ("+1", "👍", …).',
	screenshot: 'https://user-images.githubusercontent.com/1402241/45543717-d45f3c00-b847-11e8-84a5-8c439d0ad1a5.png'
}, {
	include: [
		pageDetect.isIssue
	],
	init
});
