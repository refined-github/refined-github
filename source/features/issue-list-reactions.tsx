import React from 'dom-chef';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import observe from '../helpers/selector-observer.js';

type ReactionGroup = {
	content: string;
	reactors: {totalCount: number};
};

// Maps GitHub search sort parameter to GraphQL ReactionContent enum
const sortToReactionContent = new Map([
	['+1', 'THUMBS_UP'],
	['-1', 'THUMBS_DOWN'],
	['smile', 'LAUGH'],
	['tada', 'HOORAY'],
	['confused', 'CONFUSED'],
	['heart', 'HEART'],
	['rocket', 'ROCKET'],
	['eyes', 'EYES'],
]);

const reactionEmoji = new Map([
	['THUMBS_UP', '\u{1F44D}'],
	['THUMBS_DOWN', '\u{1F44E}'],
	['LAUGH', '\u{1F604}'],
	['HOORAY', '\u{1F389}'],
	['CONFUSED', '\u{1F615}'],
	['HEART', '\u{2764}\u{FE0F}'],
	['ROCKET', '\u{1F680}'],
	['EYES', '\u{1F440}'],
]);

let reactionContent: string | undefined;
// Keyed by issue href (e.g. "/owner/repo/issues/123"), stable across sort changes
const reactionsByHref = new Map<string, ReactionGroup[]>();

function getSortedReaction(url?: string): string | undefined {
	const search = url ? new URL(url).search : location.search;
	const query = new URLSearchParams(search).get('q') ?? '';

	// Specific reaction: sort:reactions-+1-desc
	const match = /sort:reactions-(\S+?)-(asc|desc)/.exec(query);
	if (match) {
		return sortToReactionContent.get(match[1]);
	}

	// Total reactions: sort:reactions-desc
	if (/\bsort:reactions-(asc|desc)\b/.test(query)) {
		return 'TOTAL';
	}

	return undefined;
}

function renderReaction(reactionGroups: ReactionGroup[]): HTMLElement | undefined {
	if (!reactionContent) {
		return undefined;
	}

	let emoji: string;
	let count: number;

	if (reactionContent === 'TOTAL') {
		count = reactionGroups.reduce((sum, g) => sum + g.reactors.totalCount, 0);
		const active = reactionGroups
			.filter(g => g.reactors.totalCount > 0)
			.sort((a, b) => b.reactors.totalCount - a.reactors.totalCount);

		if (active.length <= 2) {
			emoji = active
				.map(g => reactionEmoji.get(g.content) ?? g.content)
				.join('');
		} else {
			emoji = (reactionEmoji.get(active[0].content) ?? active[0].content) + `+${active.length - 1}`;
		}
	} else {
		const group = reactionGroups.find(g => g.content === reactionContent);
		if (!group) {
			return undefined;
		}

		count = group.reactors.totalCount;
		emoji = reactionEmoji.get(group.content) ?? group.content;
	}

	if (count === 0) {
		return undefined;
	}

	return (
		<span className='rgh-reactions color-fg-muted text-small'>
			{emoji}
			{' '}
			{count}
		</span>
	) as HTMLElement;
}

function clearReactions(): void {
	for (const element of document.querySelectorAll('.rgh-reactions')) {
		element.remove();
	}
}

function insertReactionForRow(row: Element): void {
	const titleLink = row.querySelector('a[data-testid="issue-pr-title-link"]');
	if (!titleLink) {
		return;
	}

	const href = titleLink.getAttribute('href') ?? '';
	const reactionGroups = reactionsByHref.get(href);
	if (!reactionGroups) {
		return;
	}

	if (row.querySelector('.rgh-reactions')) {
		return;
	}

	const reactionElement = renderReaction(reactionGroups);
	if (!reactionElement) {
		return;
	}

	// Use the empty metadata slot before assignees (its own grid column)
	const assigneesDiv = row.querySelector('[data-testid="list-row-assignees"]');
	const slot = assigneesDiv?.previousElementSibling;
	if (slot instanceof HTMLElement && !('testid' in slot.dataset)) {
		slot.append(reactionElement);
		return;
	}

	// Fallback: append inside comments column
	const commentsDiv = row.querySelector('[data-testid="list-row-comments"]');
	if (commentsDiv) {
		commentsDiv.append(reactionElement);
	}
}

function insertAllReactions(): void {
	for (const row of document.querySelectorAll('[class^="IssueRow"]')) {
		insertReactionForRow(row);
	}
}

async function fetchMissingReactions(): Promise<void> {
	const missing = new Map<number, string>();
	for (const row of document.querySelectorAll('[class^="IssueRow"]')) {
		const titleLink = row.querySelector('a[data-testid="issue-pr-title-link"]');
		if (!titleLink) {
			continue;
		}

		const href = titleLink.getAttribute('href') ?? '';
		if (reactionsByHref.has(href)) {
			continue;
		}

		const match = /\/issues\/(\d+)$/.exec(href);
		if (match) {
			missing.set(Number(match[1]), href);
		}
	}

	if (missing.size === 0) {
		return;
	}

	const issueNumbers = [...missing.keys()];
	const {repository} = await api.v4(`
		repository() {
			${issueNumbers.map(number => `
				${api.escapeKey(number)}: issue(number: ${number}) {
					reactionGroups {
						content
						reactors { totalCount }
					}
				}
			`).join('\n')}
		}
	`);

	for (const [number, href] of missing) {
		const data = repository[api.escapeKey(number)] as {reactionGroups: ReactionGroup[]} | undefined;
		if (data?.reactionGroups) {
			reactionsByHref.set(href, data.reactionGroups);
		}
	}
}

async function init(signal: AbortSignal): Promise<void> {
	reactionContent = getSortedReaction();

	// On initial load with reaction sort, eagerly fetch reaction data
	if (reactionContent) {
		await elementReady('[class^="IssueRow"]', {signal});
		await fetchMissingReactions();
		insertAllReactions();
	}

	// Insert from cache when rows render, and debounce a fetch for uncached rows
	let pendingFetch: ReturnType<typeof setTimeout>;
	observe('[data-testid="list-row-comments"]', (commentsElement: HTMLElement) => {
		if (!reactionContent) {
			return;
		}

		const row = commentsElement.closest('[class^="IssueRow"]');
		if (row) {
			insertReactionForRow(row);
		}

		// After rows settle, fetch any reactions not yet cached
		clearTimeout(pendingFetch);
		pendingFetch = setTimeout(async () => {
			if (signal.aborted) {
				return;
			}

			try {
				await fetchMissingReactions();
			} catch {}

			if (!signal.aborted) {
				insertAllReactions();
			}
		}, 300);
	}, {signal});

	// Update state on sort/filter changes
	if (globalThis.navigation) {
		navigation.addEventListener('navigate', (event: NavigateEvent) => {
			reactionContent = getSortedReaction(event.destination.url);
			clearReactions();
			clearTimeout(pendingFetch);

			if (reactionContent) {
				// Fallback: observe may not fire if React reuses DOM elements in place
				pendingFetch = setTimeout(async () => {
					if (signal.aborted) {
						return;
					}

					try {
						await fetchMissingReactions();
					} catch {}

					if (!signal.aborted) {
						insertAllReactions();
					}
				}, 500);
			}
		}, {signal});
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoIssueList,
	],
	awaitDomReady: true,
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github/issues?q=sort%3Areactions-%2B1-desc
https://github.com/pypi/warehouse/issues?q=is%3Aissue+is%3Aopen+sort%3Areactions-desc

*/
