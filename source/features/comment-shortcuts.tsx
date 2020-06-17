import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';

const shortcutKeys = new Set(['e', 'd', 'h', 'j', 'k', '+', '-', 'n']);
const shortcutClass: Record<string, string> = {
	e: '.rgh-edit-comment, [aria-label="Edit comment"]',
	d: '[aria-label="Delete comment"]',
	h: '[aria-label="Hide comment"]',
	'+': '[data-reaction-label="+1"]',
	'-': '[data-reaction-label="-1"]'
};

function triggerShortcut(shortcut: string) {
	const selectedComment = select(location.hash)!;
	select<HTMLButtonElement>(shortcutClass[shortcut], selectedComment)?.click();
}

function focusComment({delegateTarget: comment}: delegate.Event<MouseEvent, HTMLButtonElement>): void {
	if (select.exists(':target')) {
		console.log('I dont work correctly');
	}

	history.replaceState({}, document.title, select<HTMLAnchorElement>('a.js-timestamp', comment)!.hash);
}

function init(): void {
	delegate(document, '.timeline-comment.unminimized-comment, .review-comment', 'click', focusComment);
	document.addEventListener('keypress', event => {
		if (!shortcutKeys.has(event.key) || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLInputElement) {
			return;
		}

		event.preventDefault();

		if (['j', 'k'].includes(event.key)) {
			const items = select.all<HTMLAnchorElement>('.timeline-comment-group[id^="issue"]:not([href])');
			// `j` goes to the next comment `k` goes back a comment
			const direction = event.key === 'j' ? 1 : -1;
			// Find current
			const currentComment = location.hash.startsWith('#issue') ? select<HTMLAnchorElement>(location.hash)! : select<HTMLAnchorElement>(':target')!;
			const currentIndex = items.indexOf(currentComment);
			// Nothing selected or were on the first comment
			if (currentIndex + direction < 0 || currentIndex === -1) {
				return;
			}

			// Find chosen
			const chosen = items[Math.min(currentIndex + direction, items.length - 1)]; // Clamp it so it cant go past the last one

			// Focus comment and dont put into history
			location.replace(select<HTMLAnchorElement>('a.js-timestamp', chosen)!.hash);
			chosen.scrollIntoView({
				block: 'start'
			});

			return;
		}

		if (event.key === 'n') {
			select<HTMLTextAreaElement>('#new_comment_field')?.focus();
			return;
		}

		if (/^#issue|^#discussion_/.test(location.hash)) {
			triggerShortcut(event.key);
		}
	});
}

void features.add({
	id: __filebasename,
	description: '',
	screenshot: false,
	shortcuts: {
		j: 'Move up a comment',
		k: 'Move down a comment',
		e: 'Edit the focused comment',
		d: 'Delete the focused comment',
		h: 'Hide the focused comment',
		'+': 'Add a 👍 reaction',
		'-': 'Add a 👎 reaction'
	}
}, {
	include: [
		pageDetect.hasComments
	],
	repeatOnAjax: false,
	init
});
