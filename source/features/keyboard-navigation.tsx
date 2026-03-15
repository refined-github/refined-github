import {$optional} from 'select-dom/strict.js';
import {$$, elementExists} from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import {isEditable} from '../helpers/dom-utils.js';

const isDisplayNone = (element: Element | undefined): boolean =>
	Boolean(element && getComputedStyle(element).display === 'none');

const isCommentGroupMinimized = (comment: HTMLElement): boolean =>
	elementExists('.minimized-comment:not(.d-none)', comment)
	// Review comments on Files tab
	|| isDisplayNone(
		comment.closest(['.js-file-content', '.js-file-level-comments-table'])
		?? undefined,
	)
	|| Boolean(
		comment.closest([
			'.js-resolvable-thread-contents.d-none', // Regular comments
			'details.js-resolvable-timeline-thread-container:not([open])', // Review comments on Conversation tab
		]),
	);

const isFileMinimized = (element: HTMLElement | undefined): boolean =>
	Boolean(
		element?.classList.contains('js-file')
		&& isDisplayNone($optional('.js-file-content', element)),
	);

let lastViewChange: HTMLElement | undefined;
function trackLastViewChange(event: Event): void {
	const element
		= (event.target as EventTarget & Partial<Pick<Element, 'closest'>>).closest?.(
			'.js-targetable-element[id^="diff-"]',
		) ?? undefined;
	if (element) {
		lastViewChange = element;
	}
}

function runShortcuts(event: KeyboardEvent): void {
	if (
		(event.key !== 'j' && event.key !== 'k' && event.key !== 'x')
		|| isEditable(event.target)
	) {
		return;
	}

	const focusedComment
		= $optional(globalThis.location.hash || ':target') ?? lastViewChange;

	if (event.key === 'x') {
		if (!focusedComment) {
			return;
		}

		const toggle = $optional('.js-reviewed-toggle', focusedComment);
		if (toggle) {
			const wasFileMinimized = isFileMinimized(focusedComment);
			event.preventDefault();
			toggle.click();
			if (wasFileMinimized) {
				location.replace('#' + focusedComment.id);
			}
		}

		return;
	}

	event.preventDefault();

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

	// `j` goes to the next comment, `k` goes back a comment
	const direction = event.key === 'j' ? 1 : -1;
	// Without `focusedElement`, it will start from -1
	const currentIndex = items.indexOf(focusedComment!);

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
	document.body.addEventListener('change', trackLastViewChange);
	document.body.addEventListener('click', trackLastViewChange);
	document.body.addEventListener('focus', trackLastViewChange);
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

/*

Test URLs:

https://github.com/refined-github/refined-github/pull/4030#discussion_r584184640
https://github.com/refined-github/refined-github/pull/8517/changes

*/
