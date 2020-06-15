import select from 'select-dom';
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

function init(): void {
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
			const currentIndex = items.indexOf(select<HTMLAnchorElement>(':target')!);
			const verifiedCurrentIndex = currentIndex + direction < 0 ? 0 : currentIndex + direction; // :target might not be navigable, therefore `-1`

			// Find chosen
			const chosen = items[Math.min(verifiedCurrentIndex, items.length - 1)]; // Clamp it so it cant go past the last one

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

		if (location.hash.startsWith('issue')) {
			triggerShortcut(event.key);
		}
	});
}

void features.add({
	id: __filebasename,
	description: '',
	screenshot: false
}, {
	include: [
		pageDetect.hasComments
	],
	repeatOnAjax: false,
	init
});
