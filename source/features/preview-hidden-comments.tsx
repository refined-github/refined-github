import select from 'select-dom';
import features from '../libs/features';

const REASON_MAP = {
	resolved: 'Resolved',
	outdated: 'Outdated',
	'off-topic': 'Off Topic',
	'disruptive content': 'Abuse',
	spam: 'Spam'
};

const ignoredReasons = ['Abuse', 'Spam'];
const reasonRegExp = /^This comment was marked as ([^.]+)\.$/;
const parseMinimizationReason = (header: Element): string => {
	const [, reason]: any[] = header.textContent.trim().match(reasonRegExp) || [];
	return REASON_MAP[reason] || 'Minimized';
};

const init = () => {
	for (const details of select.all('.minimized-comment:not(.d-none) > details:not(.rgh-preview-hidden-comments)')) {
		details.classList.add('rgh-preview-hidden-comments');

		const content = select('.review-comment-contents .comment-body', details);
		const commentText = content.textContent.trim();
		if (!commentText) {
			continue;
		}

		const header = select('summary .timeline-comment-header-text, summary .discussion-item-copy', details);
		const reason = parseMinimizationReason(header);
		if (ignoredReasons.includes(reason)) {
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
