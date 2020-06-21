import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {isEditable} from '../helpers/dom-utils';

const shortcutClass = new Map<string, string>([
	['e', '.unminimized-comment [aria-label="Edit comment"]:not([hidden])'],
	['d', '[aria-label="Delete comment"]']
]);

function runShortcuts(event: KeyboardEvent): void {
	if (isEditable(event.target)) {
		return;
	}

	const focusedComment = select(':target')!;

	if (['j', 'k'].includes(event.key)) {
		event.preventDefault();

		const items = select.all('.js-minimizable-comment-group')
			.filter(comment => !comment.querySelector('.minimized-comment:not(.d-none)'));
		// `j` goes to the next comment, `k` goes back a comment
		const direction = event.key === 'j' ? 1 : -1;

		const currentIndex = items.indexOf(focusedComment);

		// Start at 0 if nothing is; clamp index
		const chosenCommentIndex = Math.min(
			Math.max(0, currentIndex + direction),
			items.length - 1
		);

		// Focus comment without pushing to history
		location.replace('#' + items[chosenCommentIndex].id);
		items[chosenCommentIndex].scrollIntoView();
		return;
	}

	const actionClass = shortcutClass.get(event.key);
	if (actionClass) {
		event.preventDefault();
		select(actionClass, focusedComment)?.click();
	}
}

function init(): void {
	document.addEventListener('keypress', runShortcuts);
}

void features.add({
	id: __filebasename,
	description: 'Adds shortcuts to comments: `j` to move down a comment; `k` to move up a comment.; `e` to edit a comment; `d` to delete a comment',
	screenshot: false,
	shortcuts: {
		j: 'Move down a comment',
		k: 'Move up a comment',
		e: 'Edit the focused comment',
		d: 'Delete the focused comment'
	}
}, {
	include: [
		pageDetect.hasComments
	],
	repeatOnAjax: false,
	init
});
