import select from 'select-dom';
import features from '../libs/features';

const allowedReasons = ['resolved', 'outdated', 'off-topic'];


const init = () => {
	for (const details of select.all('.minimized-comment:not(.d-none) > details:not(.rgh-preview-hidden-comments)')) {
		details.classList.add('rgh-preview-hidden-comments');

		const content = select('.review-comment-contents .comment-body', details);
		const commentText = content.textContent.trim();
		if (!commentText) {
			continue;
		}

		const header = select('summary .timeline-comment-header-text, summary .discussion-item-copy', details);

		const headerLabel = header.textContent;
		const [, reason]: string[] = headerLabel.trim().match(/was marked as ([^.]+)/);
		if (!allowedReasons.includes(reason)) {
			continue;
		}

		header.textContent = `${reason}: ${commentText}`;
	}
};

features.add({
	id: 'preview-hiddden-comments',
	include: [
		features.isPR,
		features.isIssue,
		features.isCommit
	],
	load: features.onNewComments,
	init
});
