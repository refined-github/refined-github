import {h} from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from '../libs/page-detect';

export default function () {
	if (!pageDetect.isIssue()) {
		return;
	}

	let uselessCount = 0;
	for (const commentText of select.all('.comment-body > p:only-child')) {
		// Find useless comments
		if (!/^([+-]\d+!*|👍|🙏|👎|👌|)+$/.test(commentText.textContent.trim())) {
			continue;
		}

		// Comments that contain useful images shouldn't be removed
		if (select.exists('a img', commentText)) {
			continue;
		}

		// Ensure that they're not by VIPs (owner, collaborators, etc)
		const comment = commentText.closest('.js-timeline-item');
		if (select.exists('.timeline-comment-label', comment)) {
			continue;
		}

		// If the person is having a conversation, then don't hide it
		const author = select('.author', comment).getAttribute('href');
		// If the first comment left by the author isn't a useless comment
		// (previously hidden or about to be hidden), then leave this one as well
		const previousComment = select(`.js-timeline-item:not([hidden]) .unminimized-comment .author[href="${author}"]`);
		if (previousComment && previousComment.closest('.js-timeline-item') !== comment) {
			continue;
		}

		comment.hidden = true;
		comment.classList.add('rgh-hidden-comment');
		uselessCount++;
	}

	if (uselessCount > 0) {
		select('.discussion-timeline-actions').prepend(
			<p class="rgh-useless-comments-note">
				{`${uselessCount} useless comment${uselessCount > 1 ? 's were' : ' was'} automatically hidden. `}
				<button class="btn-link text-emphasized" onClick={unhide}>Show</button>
			</p>
		);
	}
}

function unhide(event) {
	for (const comment of select.all('.rgh-hidden-comment')) {
		comment.hidden = false;
	}
	select('.rgh-hidden-comment').scrollIntoView();
	event.target.parentElement.remove();
}
