import './preview-hidden-comments.css';
import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {upperCaseFirst} from '../github-helpers';

const forbiddenReasons = new Set(['spam', 'duplicate', 'disruptive content']);

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

		const reason = /was marked as ([^.]+)/.exec(header.textContent!)?.[1] ?? (header.textContent!.trim().endsWith('has been minimized.') ? 'duplicate' : '');
		if (forbiddenReasons.has(reason)) {
			continue;
		}

		header.append(
			<span className="Details-content--open">{header.firstChild}</span>,
			<span className="Details-content--closed">{(reason.length > 0 ? upperCaseFirst(reason) + ' — ' : '') + commentText}</span>
		);
	}
};

void features.add(__filebasename, {
	include: [
		pageDetect.hasComments
	],
	init
});
