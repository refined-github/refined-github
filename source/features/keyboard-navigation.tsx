import {$, $$, elementExists} from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import {isEditable} from '../helpers/dom-utils.js';

const isCommentGroupMinimized = (comment: HTMLElement): boolean =>
	elementExists('.minimized-comment:not(.d-none)', comment)
	|| Boolean(comment.closest([
		'.js-resolvable-thread-contents.d-none', // Regular comments
		'details.js-resolvable-timeline-thread-container:not([open])', // Review comments
	]));

function runShortcuts(event: KeyboardEvent): void {
	if ((event.key !== 'j' && event.key !== 'k') || isEditable(event.target)) {
		return;
	}

	event.preventDefault();

	const focusedComment = $(':target')!;
	const items
		= $$([
			'.js-targetable-element[id^="diff-"]', // Files in diffs
			'.js-minimizable-comment-group', // Comments (to be `.filter()`ed)
		])
			.filter(element =>
				element.classList.contains('js-minimizable-comment-group')
					? !isCommentGroupMinimized(element)
					: true,
			);

	// `j` goes to the next comment, `k` goes back a comment
	const direction = event.key === 'j' ? 1 : -1;
	const currentIndex = items.indexOf(focusedComment);

	// Start at 0 if nothing is; clamp index
	const chosenCommentIndex = Math.min(
		Math.max(0, currentIndex + direction),
		items.length - 1,
	);

	if (currentIndex !== chosenCommentIndex) {
		// Focus comment without pushing to history
		location.replace('#' + items[chosenCommentIndex].id);
	}
}

function init(signal: AbortSignal): void {
	document.body.addEventListener('keypress', runShortcuts, {signal});
}

void features.add(import.meta.url, {
	shortcuts: {
		j: 'Focus the comment/file below',
		k: 'Focus the comment/file above',
	},
	include: [
		pageDetect.hasComments,
	],
	init,
});
