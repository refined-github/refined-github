import * as pageDetect from 'github-url-detection';
import {$$, $optional, closestElementOptional, elementExists} from 'select-dom';

import features from '../feature-manager.js';
import {isEditable} from '../helpers/dom-utils.js';
import {viewedToggleSelector} from './batch-mark-files-as-viewed.js';

const itemSelectors = [
	'div[class*="targetable" i][id^="diff-"]', // Files in diffs
	'.js-minimizable-comment-group', // Legacy comments
	'.react-issue-body', // New issue view: issue description
	'.react-issue-comment', // New issue view: comments
] as const;

const permalinkSelectors = [
	'a[href*="#issue-"]', // Issue description permalink
	'a[href*="#issuecomment-"]', // Issue comment permalink
] as const;

const isCommentGroupMinimized = (comment: HTMLElement): boolean =>
	elementExists('.minimized-comment:not(.d-none)', comment)
	|| Boolean(closestElementOptional([
		'.js-resolvable-thread-contents.d-none', // Regular comments
		'details.js-resolvable-timeline-thread-container:not([open])', // Review comments
	], comment));

function getItemHash(item: HTMLElement): string | undefined {
	if (item.id) {
		return '#' + item.id;
	}

	const link = $optional(permalinkSelectors, item);
	return link instanceof HTMLAnchorElement ? link.hash : undefined;
}

function getCurrentItem(items: HTMLElement[]): HTMLElement | undefined {
	const targetElement = $optional(':target');
	const itemFromTarget = targetElement && closestElementOptional(itemSelectors, targetElement);
	if (itemFromTarget) {
		return itemFromTarget;
	}

	return items.find(item => getItemHash(item) === location.hash);
}

function focusItem(item: HTMLElement): void {
	const hash = getItemHash(item);
	if (!hash) {
		return;
	}

	if (item.id || $optional(hash)) {
		// Make item a target without pushing to history
		location.replace(hash);
	} else {
		item.scrollIntoView();
		history.replaceState(history.state, document.title, hash);
	}
}

function runShortcuts(event: KeyboardEvent): void {
	if (!'jkx'.includes(event.key) || isEditable(event.target)) {
		return;
	}

	event.preventDefault();
	const targetElement = $optional(':target') ?? undefined;

	if (event.key === 'x') {
		// The event handler is quite broad, there's no guarantee that the intention is to toggle "Viewed"
		$optional(viewedToggleSelector, targetElement)?.click();
		return;
	}

	const items = $$(itemSelectors)
		.filter(element =>
			element.classList.contains('js-minimizable-comment-group')
				? !isCommentGroupMinimized(element)
				: true,
		);

	// `j` goes to the next item, `k` goes back an item
	const direction = event.key === 'j' ? 1 : -1;
	// Without a current item, it will start from -1
	const currentIndex = items.indexOf(getCurrentItem(items)!);

	// Start at 0 if nothing is; clamp index
	const chosenItemIndex = Math.min(
		Math.max(0, currentIndex + direction),
		items.length - 1,
	);

	if (currentIndex !== chosenItemIndex) {
		focusItem(items[chosenItemIndex]);
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
https://github.com/refined-github/refined-github/issues/7856

*/
