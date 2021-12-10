import './preview-hidden-comments.css';
import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {upperCaseFirst} from '../github-helpers.js';

function init(): void {
	// We target `.comment-body` directly because hidden review comments are only loaded when first expanded, except when opening a link
	// pointing to another review comment in the same thread (e.g. https://github.com/refined-github/refined-github/pull/4520#discussion_r659341139) #4915
	for (const comment of select.all('.minimized-comment:not(.d-none) > details:not(.rgh-preview-hidden-comments) .comment-body:not(.js-preview-body)')) {
		const details = comment.closest('details')!;
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
			<span className="Details-content--open">{select(':scope > .d-inline-block', header) ?? header.firstChild}</span>,
			<span className="Details-content--closed">{`${upperCaseFirst(reason)} — ${commentText.slice(0, 100)}`}</span>,
		);
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasComments,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
