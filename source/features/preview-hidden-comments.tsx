import './preview-hidden-comments.css';
import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import {upperCaseFirst} from '../github-helpers';
import observe from '../helpers/selector-observer';

function preview(hiddenCommentHeader: HTMLElement): void {
	const details = hiddenCommentHeader.closest('details')!;
	details.classList.add('rgh-preview-hidden-comments'); // Used in CSS

	const comment = select('.comment-body', details)!
	const commentText = comment.textContent!.trim();
	if (commentText.length === 0) {
		return;
	}

	const reason = /duplicate|outdated|off-topic|hidden/.exec(hiddenCommentHeader.textContent!)?.[0];
	if (!reason) {
		return;
	}

	hiddenCommentHeader.classList.add('css-truncate', 'css-truncate-overflow', 'mr-2');
	hiddenCommentHeader.append(
		<span className="Details-content--open">{hiddenCommentHeader.firstChild}</span>,
		<span className="Details-content--closed">
			<span className="Label mr-2">{upperCaseFirst(reason)}</span>{commentText.slice(0, 100)}
		</span>,
	);
}

function init(signal: AbortSignal): void {
	// `.timeline-comment-group` excludes review comments, which are always loaded on click, so it's not possible to preview them
	observe('.timeline-comment-group .minimized-comment .timeline-comment-header-text', preview, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasComments,
	],
	awaitDomReady: false,
	init,
});

/*
Test URLs
https://github.com/refined-github/sandbox/pull/47
*/
