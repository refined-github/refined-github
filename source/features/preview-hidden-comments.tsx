import './preview-hidden-comments.css';
import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {upperCaseFirst} from '../github-helpers';

function init(): void {
	for (const details of select.all('.minimized-comment:not(.d-none) > details:not(.rgh-preview-hidden-comments)')) {
		const comment = select('.comment-body', details);
		// Hidden review comments are only loaded when first expanded, except when opening a link pointing to another review comment in the same thread
		// (e.g. https://github.com/refined-github/refined-github/pull/4520#discussion_r659341139)
		if (!comment) {
			continue;
		}

		details.classList.add('rgh-preview-hidden-comments');
		const commentText = comment.textContent!.trim();
		if (commentText.length === 0) {
			continue;
		}

		const header = select([
			'.timeline-comment-header-text', // Issue and commit comments
			'summary h3', // Review Comments
		], details)!;

		const reason = /off-topic|hidden/.exec(header.textContent!)?.[0];
		if (!reason) {
			continue;
		}

		header.append(
			<span className="Details-content--open">{header.firstChild}</span>,
			<span className="Details-content--closed">{`${upperCaseFirst(reason)} — ${commentText.slice(0, 100)}`}</span>,
		);
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.hasComments,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
