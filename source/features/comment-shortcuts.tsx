import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {isEditable} from '../helpers/dom-utils';

const shortcutClass = new Map<string, string>([
	['e', '.unminimized-comment [aria-label="Edit comment"]:not([hidden])'],
	['d', '[aria-label="Delete comment"]']
]);

function runShortcuts(event: KeyboardEvent): void {
	const focusedComment = select(':target');
	if (isEditable(event.target) || !focusedComment) {
		return;
	}

	if (['j', 'k'].includes(event.key)) {
		event.preventDefault();

		const items = select.all('.js-minimizable-comment-group')
			.filter(comment => !comment.querySelector('.minimized-comment:not(.d-none)'));
		// `j` goes to the next comment `k` goes back a comment
		const direction = event.key === 'j' ? 1 : -1;

		const currentIndex = items.indexOf(focusedComment);
		// Nothing selected or we are on the first comment
		if (currentIndex + direction < 0 || currentIndex === -1) {
			return;
		}

		// Find chosen and clamp it so it cant go past the last one
		const chosen = items[Math.min(currentIndex + direction, items.length - 1)];

		// Focus comment and dont put into history
		location.replace('#' + chosen.id);
		// Avoid the extra jump
		chosen.scrollIntoView();
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
