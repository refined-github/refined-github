import select from 'select-dom';
import features from '../libs/features';

const REASON_MAP = {
	resolved: 'Resolved',
	outdated: 'Outdated',
	'off-topic': 'Off Topic',
	'disruptive content': 'Abuse',
	spam: 'Spam'
};

const reasonRegExp = /^This comment was marked as ([^.]+)\.$/;
const parseMinimizationReason = (header: HTMLElement): string => {
	const [, reason]: any[] = header.textContent.trim().match(reasonRegExp) || [];
	return REASON_MAP[reason] || 'Minimized';
};

const init = () => {
	for (const details of select.all('.timeline-comment-group > .minimized-comment:not(.d-none) > details:not(.rgh-preview-hidden-comments)')) {
		details.classList.add('rgh-preview-hidden-comments');
		const header = select('summary .timeline-comment-header-text', details);
		const content = select('.review-comment .review-comment-contents .comment-body', details);

		const reason = parseMinimizationReason(header);
		header.style.textOverflow = 'ellipsis';
		header.classList.add('overflow-hidden', 'no-wrap');
		header.textContent = `${reason}: ${content.textContent.trim()}`;
	}
};

features.add({
	id: 'preview-hiddden-comments',
	include: [
		features.isPR,
		features.isIssue
	],
	load: features.onNewComments,
	init
});
