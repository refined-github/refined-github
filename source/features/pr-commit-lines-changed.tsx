import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {$optional, closestElementOptional} from 'select-dom';
import {CachedFunction} from 'webext-storage-cache';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {assertCommitHash} from '../github-helpers/index.js';
import {commitHashLinkInLists} from '../github-helpers/selectors.js';
import pluralize from '../helpers/pluralize.js';
import observe from '../helpers/selector-observer.js';
import {withTooltipRef} from '../components/tooltip.js';
import GetCommitChanges from './pr-commit-lines-changed.gql';

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

const commitChanges = new CachedFunction('commit-changes', {
	async updater(commit: string): Promise<[additions: number, deletions: number]> {
		const {repository} = await api.v4(GetCommitChanges, {
			variables: {
				commit,
			},
		});

		return [repository.object.additions, repository.object.deletions];
	},
});

function repeatItems(count: number, Item: () => React.JSX.Element): React.JSX.Element[] {
	return Array.from({length: count}, () => <Item style={{borderRadius: '2px'}} />);
}

async function addDiffStat(target: HTMLElement, commitSha: string): Promise<void> {
	const [additions, deletions] = await commitChanges.get(commitSha);
	const tooltip = pluralize(additions + deletions, '1 line changed', '$$ lines changed');
	const {green, red, gray} = calculateDiffSquareCounts(additions, deletions);
	target.prepend(
		<span ref={withTooltipRef(tooltip)} className="ml-2 tmp-ml-2 d-md-block d-none diffstat">
			<span className="color-fg-success">+{additions}</span>
			{' '}
			<span className="color-fg-danger">−{deletions}</span>
			{' '}
			{repeatItems(green, () => <span className="diffstat-block-added" />)}
			{repeatItems(red, () => <span className="diffstat-block-deleted" />)}
			{repeatItems(gray, () => <span className="diffstat-block-neutral" />)}
		</span>,
	);
}

async function addOnCommitPage(commitHash: HTMLElement): Promise<void> {
	const commitSha = location.pathname.split('/').pop()!;
	await addDiffStat(commitHash, commitSha);
}

async function addOnTimeline(timelineItem: HTMLElement): Promise<void> {
	// The timeline row on `isPRConversation` matches the third selector; the others
	// belong to `isCommitList`/`isPRCommitList`, which this feature doesn't run on.
	const shaLink = $optional(commitHashLinkInLists, timelineItem);
	if (!shaLink) {
		return;
	}

	const container = closestElementOptional('.text-right', shaLink);
	if (!container) {
		return;
	}

	const commitSha = shaLink.pathname.split('/').pop()!;
	assertCommitHash(commitSha);
	await addDiffStat(container, commitSha);
}

async function init(signal: AbortSignal): Promise<void> {
	observe('[class*="__CommitAttributionContainer"] + .text-mono', addOnCommitPage, {signal});
	observe('.js-timeline-item .TimelineItem:has(.octicon-git-commit)', addOnTimeline, {signal});
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
