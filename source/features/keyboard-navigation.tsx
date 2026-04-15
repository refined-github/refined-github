import {$optional} from 'select-dom/strict.js';
import {$$, elementExists} from 'select-dom';
import * as pageDetect from 'github-url-detection';

import {isEditable} from '../helpers/dom-utils.js';
import {viewedToggleSelector} from './batch-mark-files-as-viewed.js';
import features from '../feature-manager.js';

const isCommentGroupMinimized = (comment: HTMLElement): boolean =>
	elementExists('.minimized-comment:not(.d-none)', comment)
	|| Boolean(comment.closest([
		'.js-resolvable-thread-contents.d-none', // Regular comments
		'details.js-resolvable-timeline-thread-container:not([open])', // Review comments
	]));

function runShortcuts(event: KeyboardEvent): void {
	if (!'jkx'.includes(event.key) || isEditable(event.target)) {
		return;
	}

	event.preventDefault();
	const targetElement = $optional(':target');

	if (event.key === 'x') {
		const toggle = targetElement && $optional(viewedToggleSelector, targetElement);
		toggle?.click();
		return;
	}

	const items
		= $$([
			'div[class*="targetable" i][id^="diff-"]', // Files in diffs
			'.js-minimizable-comment-group', // Comments (to be `.filter()`ed)
		])
			.filter(element =>
				element.classList.contains('js-minimizable-comment-group')
					? !isCommentGroupMinimized(element)
					: true,
			);

	// `j` goes to the next item, `k` goes back an item
	const direction = event.key === 'j' ? 1 : -1;
	// Without `targetElement`, it will start from -1
	const currentIndex = items.indexOf(targetElement!);

	// Start at 0 if nothing is; clamp index
	const chosenItemIndex = Math.min(
		Math.max(0, currentIndex + direction),
		items.length - 1,
	);

	if (currentIndex !== chosenItemIndex) {
		// Make item a target without pushing to history
		location.replace('#' + items[chosenItemIndex].id);
	}
}

function init(signal: AbortSignal): void {
	document.body.addEventListener('keypress', runShortcuts, {signal});
}

void features.add(import.meta.url, {
	shortcuts: {
		j: 'Focus the comment/file below',
		k: 'Focus the comment/file above',
		x: 'Mark the file as viewed/unviewed',
	},
	include: [
		pageDetect.hasComments,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github/pull/4030#discussion_r584184640
https://github.com/refined-github/refined-github/pull/8517/changes

*/
