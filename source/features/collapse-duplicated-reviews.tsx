import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	const singleReviewThreadComments = select.all('.review-comment.unminimized-comment:only-child');
	for (const comment of singleReviewThreadComments) {
		if (!select.exists(`.review-comment#${comment.id}:not(:only-child)`)) { // The review comment is not a duplicate
			continue;
		}

		// Change the <details> element to a link to the original comment
		const details = comment.closest('details')!;
		const commentUrl = new URL(location.href);
		commentUrl.hash = comment.id;
		details.replaceWith(
			<a
				className="d-block py-2 px-3 mb-3 border rounded-2 color-bg-subtle text-mono text-small"
				href={'#' + comment.id}
			>
				#{comment.id}
			</a>,
		);
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRConversation,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
