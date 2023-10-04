import './keyboard-navigation.css';
import {$optional} from 'select-dom/strict.js';
import {$$, elementExists} from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import {isEditable} from '../helpers/dom-utils.js';

const isDisplayNone = (element: Element | undefined): boolean => Boolean(element && getComputedStyle(element).display === 'none');

const isCommentGroupMinimized = (comment: HTMLElement): boolean =>
	elementExists('.minimized-comment:not(.d-none)', comment)
	|| isDisplayNone(comment.closest('.js-file-content') ?? undefined) // Review comments on Files tab
	|| Boolean(comment.closest([
		'.js-resolvable-thread-contents.d-none', // Regular comments
		'details.js-resolvable-timeline-thread-container:not([open])', // Review comments on Conversation tab
	]),
	);

const isFileMinimized = (element: HTMLElement | undefined): boolean =>
	Boolean(element?.classList.contains('js-file') && isDisplayNone($optional('.js-file-content', element)));

let lastViewChange: HTMLElement | undefined;
function trackLastViewChange(event: Event): void {
	const element = (event.target as EventTarget & Partial<Pick<Element, 'closest'>>).closest?.('.js-targetable-element[id^="diff-"]') ?? undefined;
	if (element) {
		lastViewChange = element;
	}
}

function runShortcuts(event: KeyboardEvent): void {
	if ((event.key !== 'j' && event.key !== 'k' && event.key !== 'x') || isEditable(event.target)) {
		return;
	}

	event.preventDefault();

	const focusedComment = $optional(globalThis.location.hash || ':target') ?? lastViewChange;

	if (event.key === 'x') {
		if (!focusedComment) {
			return;
		}

		const toggle = $optional('.js-reviewed-toggle', focusedComment);
		if (toggle) {
			const wasFileMinimized = isFileMinimized(focusedComment);
			toggle.click();
			if (wasFileMinimized) {
				location.replace('#' + focusedComment.id);
			}
		}

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

	// `j` goes to the next comment, `k` goes back a comment
	const direction = event.key === 'j' ? 1 : -1;
	// Without `focusedElement`, it will start from -1
	let currentIndex = items.indexOf(focusedComment!);
	if (currentIndex < 0) {
		const closestComment = focusedComment?.querySelector('.js-minimizable-comment-group');
		if (closestComment) {
			currentIndex = items.indexOf(closestComment);
		}
	}

	// Start at 0 if nothing is; clamp index
	const chosenCommentIndex = Math.min(
		Math.max(0, currentIndex + direction),
		items.length - 1,
	);

	if (currentIndex !== chosenCommentIndex) {
		const chosenComment = items[chosenCommentIndex];
		for (const item of items) {
			if (item.classList.contains('details-collapsed-target')) {
				item.classList.remove('details-collapsed-target');
			}

			if (item.classList.contains('not-target')) {
				item.classList.remove('not-target');
			}
		}

		if (chosenComment.classList.contains('js-details-container')) {
			if (isFileMinimized(chosenComment)) {
				// Change hash without focusing and expanding
				globalThis.history.replaceState(globalThis.history.state, '', '#' + chosenComment.id);
				chosenComment.scrollIntoView();
				chosenComment.classList.add('details-collapsed-target');
				$optional(':target')?.classList.add('not-target');
			} else {
				// Focus comment without pushing to history
				location.replace('#' + chosenComment.id);
			}
		} else {
			((function_: (index: number, next: () => void) => void) => {
				const createNext = (index: number) => () => {
					function_(index, createNext(index + 1));
				};

				createNext(0)();
			})((index, next) => {
				if (index < 2) {
					window.addEventListener('scrollend', next, {once: true, passive: true});
				} else {
					chosenComment.scrollIntoView({block: 'center'});
					if (index < 5) {
						requestAnimationFrame(next);
					}
				}
			});

			// Focus comment without pushing to history
			location.replace('#' + chosenComment.id);
		}
	}
}

function init(signal: AbortSignal): void {
	document.body.addEventListener('keypress', runShortcuts, {signal});
	document.body.addEventListener('change', trackLastViewChange);
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
