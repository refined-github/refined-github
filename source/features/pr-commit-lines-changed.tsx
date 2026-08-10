import batchedFunction from 'batched-function';
import cx from 'clsx';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {closestElementOptional} from 'select-dom';
import {objectEntries} from 'ts-extras';
import {CachedFunction} from 'webext-storage-cache';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {getRepo} from '../github-helpers/index.js';
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

/** Cross-reference rows link commits in other repos, so the repo travels with the sha */
type CommitReference = {owner: string; name: string; commitSha: string};

async function fetchChanges(references: CommitReference[]): Promise<Map<string, Changes>> {
	const byRepository = new Map<string, CommitReference[]>();
	for (const reference of references) {
		const repository = `${reference.owner}/${reference.name}`;
		byRepository.set(repository, [...byRepository.get(repository) ?? [], reference]);
	}

	const response = await api.v4([...byRepository.values()].map((group, index) => `
		_r${index}: repository(owner: "${group[0].owner}", name: "${group[0].name}") {
			${
				group.map(({commitSha}) => `
				${api.escapeKey(commitSha)}: object(expression: "${commitSha}") {
					... on Commit {
						additions
						deletions
					}
				}
			`).join('\n')
			}
		}
	`).join('\n'));

	const changes = new Map<string, Changes>();
	// A whole repository resolves to null once it's deleted or turned private
	for (const repository of Object.values(response)) {
		if (!repository) {
			continue;
		}

		for (const [key, commit] of objectEntries(repository as AnyObject)) {
			// A single commit resolves to null when it's been garbage-collected
			if (commit) {
				changes.set(key.slice(1), [commit.additions, commit.deletions]);
			}
		}
	}

	return changes;
}

// Keyed by sha alone: a commit's diffstat is the same wherever the commit is mirrored
const commitChanges = new CachedFunction('commit-changes', {
	async updater(commitSha: string): Promise<Changes> {
		const {owner, name} = getRepo()!;
		const changes = await fetchChanges([{owner, name, commitSha}]);
		const commitChange = changes.get(commitSha);
		if (!commitChange) {
			throw new Error(`Commit not found: ${commitSha}`);
		}

		return commitChange;
	},
	// A commit's diffstat never changes, so this only expires to bound storage growth
	maxAge: {days: 100},
});

function repeatItems(count: number, Item: () => React.JSX.Element): React.JSX.Element[] {
	return Array.from({length: count}, () => <Item style={{borderRadius: '2px'}} />);
}

// Not a JSX component: dom-chef calls those without props
function buildDiffStat(additions: number, deletions: number, display: string): React.JSX.Element {
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
	commitHash.prepend(buildDiffStat(additions, deletions, 'd-md-block d-none'));
}

// The owner/name are needed because cross-reference rows link to other repos
const commitUrl = /^\/(?<owner>[\w\-.]+)\/(?<name>[\w\-.]+)\/commit\/(?<commitSha>[\da-f]{40})$/;

/** Both the PR's own commits and the "added a commit that referenced this pull request" rows */
async function addOnTimeline(shaLinks: HTMLAnchorElement[]): Promise<void> {
	const rows: Array<{shaContainer: HTMLElement; reference: CommitReference}> = [];
	for (const shaLink of shaLinks) {
		const shaContainer = closestElementOptional('.text-right', shaLink);
		// Null on rows linking something other than a single commit, like a force-push comparison
		const reference = commitUrl.exec(shaLink.pathname)?.groups as CommitReference | undefined;
		if (shaContainer && reference) {
			rows.push({shaContainer, reference});
		}
	}

	const changes = new Map<string, Changes>();
	const uncached: CommitReference[] = [];
	for (const {reference} of rows) {
		// eslint-disable-next-line no-await-in-loop -- Reads from local storage, not the API
		const cached = await commitChanges.getCached(reference.commitSha);
		if (cached) {
			changes.set(reference.commitSha, cached);
		} else if (uncached.every(({commitSha}) => commitSha !== reference.commitSha)) {
			uncached.push(reference);
		}
	}

	if (uncached.length > 0) {
		for (const [commitSha, commitChange] of await fetchChanges(uncached)) {
			changes.set(commitSha, commitChange);
			void commitChanges.setCached(commitChange, commitSha);
		}
	}

	for (const {shaContainer, reference} of rows) {
		const commitChange = changes.get(reference.commitSha);
		if (commitChange) {
			const [additions, deletions] = commitChange;
			// Beside the sha rather than inside its right-aligned column, which would stack it above
			shaContainer.before(buildDiffStat(additions, deletions, 'd-md-inline-block d-none'));
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
