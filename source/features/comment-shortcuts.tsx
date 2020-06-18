import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {isEditable} from '../helpers/dom-utils';

const shortcutClass = new Map<string, string>([
	['e', '.rgh-edit-comment, [aria-label="Edit comment"]'],
	['d', '[aria-label="Delete comment"]'],
	['h', '[aria-label="Hide comment"]']
]);

function commentHash(comment: HTMLElement): string {
	// What do I call this var??
	const reviewComment = comment.closest('.js-comment[id^="pullrequestreview-"]');
	const {hash} = reviewComment ? reviewComment.querySelector<HTMLAnchorElement>('a.js-timestamp')! : comment.querySelector<HTMLAnchorElement>('a.js-timestamp')!;

	return reviewComment ? hash + '-body-html' : hash;
}

function runShortcuts(event: KeyboardEvent): void {
	if (isEditable(event.target)) {
		return;
	}

	if (['j', 'k'].includes(event.key)) {
		event.preventDefault();

		const items = select.all<HTMLAnchorElement>([
			'.timeline-comment-group[id^="issue"]:not([href])', // Regular comments
			'.timeline-comment-group[id^="pullrequestreview-"]:not([href])', // Base review comments (Approved/ChangesRequested)
			'.review-comment.js-minimizable-comment-group' // Review comments
		]).filter(element => !element.querySelector('.minimized-comment:not(.d-none)'));
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
		location.replace(commentHash(chosen));
		chosen.scrollIntoView();
		return;
	}

	const actionClass = shortcutClass.get(event.key);
	if (actionClass) {
		event.preventDefault();
		const target = select(':target');
		if (!target || location.hash === '#partial-timeline') {
			return;
		}

		const popup = (target.querySelector(location.hash.replace(/^#/, '#details-')) ?? target.querySelector('[aria-label="Show options"]')!.closest('details')) as HTMLDetailsElement;
		popup.open = true;
		// Dont show the jump
		popup.style.opacity = '0';
		// Wait for it to open
		setTimeout(() => {
			select(actionClass, popup)?.click();
		}, 30);
		popup.style.opacity = 'inherit';
		if (event.key !== 'h' || !select.exists(actionClass, popup)) {
			popup.open = false;
		}
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
		j: 'Move up a comment',
		k: 'Move down a comment',
		e: 'Edit the focused comment',
		d: 'Delete the focused comment',
		h: 'Hide the focused comment'
	}
}, {
	include: [
		pageDetect.hasComments
	],
	repeatOnAjax: false,
	init
});
