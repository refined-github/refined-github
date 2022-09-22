import './preview-hidden-comments.css';
import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import {upperCaseFirst} from '../github-helpers';
import observe from '../helpers/selector-observer';

function preview(comment: HTMLElement): void {
	const details = comment.closest('details')!;
	details.classList.add('rgh-preview-hidden-comments'); // Used in CSS

	const commentText = comment.textContent!.trim();
	if (commentText.length === 0) {
		return;
	}

	const header = select([
		'.timeline-comment-header-text', // Issue and commit comments
		'summary h3', // Review Comments
	], details)!;

	const reason = /off-topic|hidden/.exec(header.textContent!)?.[0];
	if (!reason) {
		return;
	}

	header.classList.add('css-truncate', 'css-truncate-overflow', 'mr-2');
	header.append(
		<span className="Details-content--open">{select(':scope > .d-inline-block', header) ?? header.firstChild}</span>,
		<span className="Details-content--closed">
			<span className="Label mr-2">{upperCaseFirst(reason)}</span>{commentText.slice(0, 100)}
		</span>,
	);
}

function init(signal: AbortSignal): void {
	// We target `.comment-body` directly because hidden review comments are only loaded when first expanded, except when opening a link
	// pointing to another review comment in the same thread (e.g. https://github.com/refined-github/refined-github/pull/4520#discussion_r659341139) #4915
	observe('.minimized-comment:not(.d-none) > details:not(.rgh-preview-hidden-comments) .comment-body:not(.js-preview-body)', preview, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasComments,
	],
	init,
});
