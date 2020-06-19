import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {isEditable} from '../helpers/dom-utils';

const shortcutClass = new Map<string, string>([
	['e', '.rgh-edit-comment, [aria-label="Edit comment"]'],
	['d', '[aria-label="Delete comment"]']
]);

function runShortcuts(event: KeyboardEvent): void {
	if (isEditable(event.target)) {
		return;
	}

	if (['j', 'k'].includes(event.key)) {
		event.preventDefault();

		const items = select.all<HTMLAnchorElement>('.js-minimizable-comment-group')
			.filter(element => !element.querySelector('.minimized-comment:not(.d-none)'));
		// `j` goes to the next comment `k` goes back a comment
		const direction = event.key === 'j' ? 1 : -1;
		// Find current
		const currentComment = select<HTMLAnchorElement>(':target')!;
		const currentIndex = items.indexOf(currentComment);
		// Nothing selected or were on the first comment
		if (currentIndex + direction < 0 || currentIndex === -1) {
			return;
		}

		// Find chosen
		const chosen = items[Math.min(currentIndex + direction, items.length - 1)]; // Clamp it so it cant go past the last one

		// Focus comment and dont put into history
		location.replace('#' + chosen.id);
		chosen.scrollIntoView();
		return;
	}

	const actionClass = shortcutClass.get(event.key);
	if (actionClass) {
		event.preventDefault();
		if (location.hash.startsWith('#discussion_')) {
			const popup = select<HTMLDetailsElement>(location.hash.replace(/^#/, '#details-'))!;
			popup.open = true;
			setTimeout(() => {
				popup.querySelector<HTMLButtonElement>(actionClass)?.click();
			}, 30);
			popup.open = false;
			return;
		}

		select(':target')?.querySelector<HTMLButtonElement>(actionClass)?.click();
	}
}

function init(): void {
	document.addEventListener('keypress', runShortcuts);
}

void features.add({
	id: __filebasename,
	description: '',
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
