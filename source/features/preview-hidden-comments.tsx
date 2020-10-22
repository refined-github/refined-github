import './preview-hidden-comments.css';
import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {upperCaseFirst} from '../github-helpers';

const allowedReasons = new Set(['resolved', 'outdated', 'off-topic']);

const init = (): void => {
	for (const details of select.all('.minimized-comment:not(.d-none) > details:not(.rgh-preview-hidden-comments)')) {
		details.classList.add('rgh-preview-hidden-comments');

		const commentText = select('.comment-body', details)!.textContent!.trim();
		if (commentText.length === 0) {
			continue;
		}

		const header = select([
			'summary .timeline-comment-header-text', // Issue and commit comments
			'.discussion-item-icon  + div' // Review Comments
		], details)!;

		const reason = /was marked as ([^.]+)/.exec(header.textContent!)?.[1] ?? '';
		if (!allowedReasons.has(reason)) {
			continue;
		}

		header.append(
			<span className="Details-content--open">{header.firstChild}</span>,
			<span className="Details-content--closed">{`${upperCaseFirst(reason)} — ${commentText}`}</span>
		);
	}
};

void features.add(__filebasename, {}, {
	include: [
		pageDetect.hasComments
	],
	init
});
