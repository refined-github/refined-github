import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {isEditable} from '../helpers/dom-utils';

const isCommentGroupMinimized = (comment: HTMLElement): boolean =>
	select.exists('.minimized-comment:not(.d-none)', comment) ||
	Boolean(comment.closest([
		'.js-resolvable-thread-contents.d-none', // Regular comments
		'details.js-resolvable-timeline-thread-container:not([open])' // Review comments
	].join()));

function runShortcuts(event: KeyboardEvent): void {
	if (isEditable(event.target)) {
		return;
	}

	const focusedComment = select(':target')!;

	if (['j', 'k'].includes(event.key)) {
		event.preventDefault();

		const items = select
			.all([
				'.js-targetable-element[id^="diff-"]', // Files in diffs
				'.js-minimizable-comment-group'// Comments (to be `.filter()`ed)
			])
			.filter(element =>
				element.classList.contains('js-minimizable-comment-group') ?
					!isCommentGroupMinimized(element) :
					true
			);

		// `j` goes to the next comment, `k` goes back a comment
		const direction = event.key === 'j' ? 1 : -1;

		const currentIndex = items.indexOf(focusedComment);

		// Start at 0 if nothing is; clamp index
		const chosenCommentIndex = Math.min(
			Math.max(0, currentIndex + direction),
			items.length - 1
		);

		if (currentIndex !== chosenCommentIndex) {
			// Focus comment without pushing to history
			location.replace('#' + items[chosenCommentIndex].id);
		}
	}
}

function init(): void {
	document.addEventListener('keypress', runShortcuts);
}

void features.add(__filebasename, {
	shortcuts: {
		j: 'Focus the comment/file below',
		k: 'Focus the comment/file above'
	},
	include: [
		pageDetect.hasComments
	],
	init
});
