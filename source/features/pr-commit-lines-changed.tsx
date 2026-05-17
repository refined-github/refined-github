import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {CachedFunction} from 'webext-storage-cache';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import pluralize from '../helpers/pluralize.js';
import {tooltipped} from '../helpers/tooltip.js';
import GetCommitChanges from './pr-commit-lines-changed.gql';
import observe from '../helpers/selector-observer.js';
import {expectToken} from '../github-helpers/github-token.js';

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
	return Array.from({length: count}).map(() => <Item style={{borderRadius: '2px'}}/>);
}

async function add(commitHash: HTMLElement): Promise<void> {
	const commitSha = location.pathname.split('/').pop()!;
	const [additions, deletions] = await commitChanges.get(commitSha);
	const tooltip = pluralize(additions + deletions, '1 line changed', '$$ lines changed');
	const {green, red, gray} = calculateDiffSquareCounts(additions, deletions);
	commitHash.prepend(
		tooltipped(
			tooltip,
			<span className="ml-2 d-md-block d-none diffstat">
				<span className="color-fg-success">+{additions}</span>
				{' '}
				<span className="color-fg-danger">−{deletions}</span>
				{' '}
				{repeatItems(green, () => <span className="diffstat-block-added" />)}
				{repeatItems(red, () => <span className="diffstat-block-deleted" />)}
				{repeatItems(gray, () => <span className="diffstat-block-neutral" />)}
			</span>,
		),
	);
}

async function init(signal: AbortSignal): Promise<void> {
	await expectToken();
	observe('[class*="__CommitAttributionContainer"] + .text-mono', add, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRCommit,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github/pull/6674/commits/3d93b7823e3c31d3bd1900ab1ec98f5ce41203bf

*/
