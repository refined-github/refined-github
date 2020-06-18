import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';

const shortcutClass = new Map<string, string>([
	['e', '.rgh-edit-comment, [aria-label="Edit comment"]'],
	['d', '[aria-label="Delete comment"]'],
	['h', '[aria-label="Hide comment"]'],
	['j', ''],
	['k', '']
]);

function commentHash(comment: HTMLElement): string {
	// What do I call this var??
	const reviewComment = comment.closest('.js-comment[id^="pullrequestreview-"]');
	const {hash} = reviewComment ? reviewComment.querySelector<HTMLAnchorElement>('a.js-timestamp')! : comment.querySelector<HTMLAnchorElement>('a.js-timestamp')!;

	return reviewComment ? hash + '-body-html' : hash;
}

function runShortcuts(event: delegate.Event<KeyboardEvent>): void {
	if (!shortcutClass.has(event.key) || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLInputElement) {
		return;
	}

	event.preventDefault();

	if (['j', 'k'].includes(event.key)) {
		const items = select.all<HTMLAnchorElement>([
			'.timeline-comment-group[id^="issue"]:not([href])', // Regular comments
			'.timeline-comment-group[id^="pullrequestreview-"]:not([href])', // Base review comments (Approved/ChangesRequested)
			'.review-comment.js-minimizable-comment-group' // Review comments
		]);
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

	select(':target')?.querySelector<HTMLButtonElement>(shortcutClass.get(event.key)!)?.click();
}

function init(): void {
	delegate(document, '*', 'keypress', runShortcuts);
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
