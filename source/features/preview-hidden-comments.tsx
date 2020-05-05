import './preview-hidden-comments.css';
import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';

const allowedReasons = ['resolved', 'outdated', 'off-topic'];

const capitalize = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);

const init = (): void => {
	for (const details of select.all('.minimized-comment:not(.d-none) > details:not(.rgh-preview-hidden-comments)')) {
		details.classList.add('rgh-preview-hidden-comments');

		const commentText = select('.comment-body', details)!.textContent!.trim();
		if (commentText.length === 0) {
			continue;
		}

		const header = select(`
			summary .timeline-comment-header-text,
			summary .discussion-item-copy
		`, details)!;

		const reason = /was marked as ([^.]+)/.exec(header.textContent!)?.[1] ?? '';
		if (!allowedReasons.includes(reason)) {
			continue;
		}

		header.append(
			<span className="Details-content--open">{header.firstChild}</span>,
			<span className="Details-content--closed">{`${capitalize(reason)} — ${commentText}`}</span>
		);
	}
};

features.add({
	id: __filebasename,
	description: 'Preview hidden comments inline.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/52545036-6e271700-2def-11e9-8c0c-b5e0fa6f37dd.png'
}, {
	include: [
		pageDetect.hasComments
	],
	init
});
