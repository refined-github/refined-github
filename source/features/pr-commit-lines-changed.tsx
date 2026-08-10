import batchedFunction from 'batched-function';
import cx from 'clsx';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {closestElementOptional} from 'select-dom';
import {objectEntries} from 'ts-extras';
import {CachedFunction} from 'webext-storage-cache';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {assertCommitHash} from '../github-helpers/index.js';
import {commitHashLinkInLists} from '../github-helpers/selectors.js';
import pluralize from '../helpers/pluralize.js';
import observe from '../helpers/selector-observer.js';
import {withTooltipRef} from '../components/tooltip.js';

// Adapted from GitHub https://github.com/refined-github/refined-github/pull/9486#discussion_r3252807259
const totalSquares = 5;
type Squares = {green: number; red: number; gray: number};
function calculateDiffSquareCounts(linesAdded: number, linesDeleted: number): Squares {
	const linesChanged = linesAdded + linesDeleted;
	// Adjustment function to give a more accurate representation of the scale of the diff
	const adjust = linesChanged > totalSquares ? totalSquares / linesChanged : 1;

	const green = Math.floor(linesAdded * adjust);
	const red = Math.floor(linesDeleted * adjust);
	const gray = totalSquares - green - red;

	return {green, red, gray};
}

type Changes = [additions: number, deletions: number];

async function fetchChanges(commits: string[]): Promise<Map<string, Changes>> {
	const {repository} = await api.v4(`
		repository() {
			${
				commits.map(commit => `
				${api.escapeKey(commit)}: object(expression: "${commit}") {
					... on Commit {
						additions
						deletions
					}
				}
			`).join('\n')
			}
		}
	`);

	const changes = new Map<string, Changes>();
	for (const [key, commit] of objectEntries(repository)) {
		// Dangling or unreachable references resolve to null
		if (commit) {
			changes.set(key.slice(1), [commit.additions, commit.deletions]);
		}
	}

	return changes;
}

const commitChanges = new CachedFunction('commit-changes', {
	async updater(commit: string): Promise<Changes> {
		const changes = await fetchChanges([commit]);
		return changes.get(commit)!;
	},
	// A commit's diffstat never changes, so this only expires to bound storage growth
	maxAge: {days: 100},
});

function repeatItems(count: number, Item: () => React.JSX.Element): React.JSX.Element[] {
	return Array.from({length: count}, () => <Item style={{borderRadius: '2px'}} />);
}

function DiffStat({additions, deletions, display}: {additions: number; deletions: number; display: string}): React.JSX.Element {
	const tooltip = pluralize(additions + deletions, '1 line changed', '$$ lines changed');
	const {green, red, gray} = calculateDiffSquareCounts(additions, deletions);
	return (
		<span ref={withTooltipRef(tooltip)} className={cx('ml-2 tmp-ml-2 diffstat', display)}>
			<span className="color-fg-success">+{additions}</span>
			{' '}
			<span className="color-fg-danger">−{deletions}</span>
			{' '}
			{repeatItems(green, () => <span className="diffstat-block-added" />)}
			{repeatItems(red, () => <span className="diffstat-block-deleted" />)}
			{repeatItems(gray, () => <span className="diffstat-block-neutral" />)}
		</span>
	);
}

async function addOnCommitPage(commitHash: HTMLElement): Promise<void> {
	const commitSha = location.pathname.split('/').pop()!;
	const [additions, deletions] = await commitChanges.get(commitSha);
	commitHash.prepend(<DiffStat additions={additions} deletions={deletions} display="d-md-block d-none" />);
}

/** Both the PR's own commits and the "added a commit that referenced this pull request" rows */
async function addOnTimeline(shaLinks: HTMLAnchorElement[]): Promise<void> {
	const rows: Array<{shaContainer: HTMLElement; commitSha: string}> = [];
	for (const shaLink of shaLinks) {
		const shaContainer = closestElementOptional('.text-right', shaLink);
		if (!shaContainer) {
			continue;
		}

		const commitSha = shaLink.pathname.split('/').pop()!;
		assertCommitHash(commitSha);
		rows.push({shaContainer, commitSha});
	}

	const changes = new Map<string, Changes>();
	const uncached: string[] = [];
	for (const {commitSha} of rows) {
		// eslint-disable-next-line no-await-in-loop -- Reads from local storage, not the API
		const cached = await commitChanges.getCached(commitSha);
		if (cached) {
			changes.set(commitSha, cached);
		} else if (!uncached.includes(commitSha)) {
			uncached.push(commitSha);
		}
	}

	if (uncached.length > 0) {
		for (const [commitSha, commitChange] of await fetchChanges(uncached)) {
			changes.set(commitSha, commitChange);
			void commitChanges.setCached(commitChange, commitSha);
		}
	}

	for (const {shaContainer, commitSha} of rows) {
		const commitChange = changes.get(commitSha);
		if (commitChange) {
			const [additions, deletions] = commitChange;
			// Beside the sha rather than inside its right-aligned column, which would stack it above
			shaContainer.before(<DiffStat additions={additions} deletions={deletions} display="d-md-inline-block d-none" />);
		}
	}
}

async function init(signal: AbortSignal): Promise<void> {
	if (pageDetect.isPRConversation()) {
		observe(commitHashLinkInLists, batchedFunction(addOnTimeline, {delay: 100}), {signal});
	} else {
		observe('[class*="__CommitAttributionContainer"] + .text-mono', addOnCommitPage, {signal});
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRCommit,
		pageDetect.isPRConversation,
	],
	requiresToken: true,
	init,
});

/*

Test URLs:

- isPRCommit: https://github.com/refined-github/refined-github/pull/6674/commits/3d93b7823e3c31d3bd1900ab1ec98f5ce41203bf
- isPRConversation: https://github.com/refined-github/refined-github/pull/9523#commits-pushed-47b8135

*/
