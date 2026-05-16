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
	const additionBlocks = Math.round(additions / (additions + deletions) * 4);
	const deletionBlocks = Math.round(deletions / (additions + deletions) * 4);
	commitHash.prepend(
		tooltipped(
			tooltip,
			<span className="ml-2 d-md-block d-none diffstat">
				<span className="color-fg-success">+{additions}</span>
				{' '}
				<span className="color-fg-danger">−{deletions}</span>
				{' '}
				{repeatItems(additionBlocks, () => <span className="diffstat-block-added addition diffstat" />)}
				{repeatItems(deletionBlocks, () => <span className="diffstat-block-deleted deletion diffstat" />)}
				{repeatItems(5 - additionBlocks - deletionBlocks, () => <span className="diffstat-block-neutral diffstat" />)}
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
