import './mark-merge-commits-in-list.css';

import batchedFunction from 'batched-function';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import GitMergeIcon from 'octicons-plain-react/GitMerge';
import {$} from 'select-dom/strict.js';
import {objectEntries} from 'ts-extras';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {expectToken} from '../github-helpers/github-token.js';
import {assertCommitHash} from '../github-helpers/index.js';
import {commitHashLinkInLists, commitTitleInLists} from '../github-helpers/selectors.js';
import observe from '../helpers/selector-observer.js';

const filterMergeCommits = async (commits: string[]): Promise<string[]> => {
	const commitFields = commits.map((commit: string) => `
			${api.escapeKey(commit)}: object(expression: "${commit}") {
			... on Commit {
					parents {
						totalCount
					}
				}
			}
		`).join('\n');
	const {repository} = await api.v4(`
		repository() {
			${commitFields}
		}
	`);

	const mergeCommits = [];
	for (const [key, commit] of objectEntries(repository)) {
		if (commit.parents.totalCount >= 2) {
			mergeCommits.push(key.slice(1));
		}
	}

	return mergeCommits;
};

export function getCommitHash(commit: HTMLElement): string {
	const hash = $(commitHashLinkInLists, commit).pathname.split('/').pop()!;
	assertCommitHash(hash);
	return hash;
}

function updateCommitIcon(commit: HTMLElement, replace: boolean): void {
	if (replace) {
		// Align icon to the line; rem used to match the native units
		$('.octicon-git-commit', commit).replaceWith(<GitMergeIcon style={{marginLeft: '0.5rem'}} />);
	} else {
		$(commitTitleInLists, commit).prepend(<GitMergeIcon className="mr-1" />);
	}
}

async function markCommits(commits: HTMLElement[]): Promise<void> {
	const isPrConversation = pageDetect.isPRConversation();
	const mergeCommits = await filterMergeCommits(commits.map(commit => getCommitHash(commit)));
	for (const commit of commits) {
		if (mergeCommits.includes(getCommitHash(commit))) {
			commit.classList.add('rgh-merge-commit');
			updateCommitIcon(commit, isPrConversation);
		}
	}
}

async function init(signal: AbortSignal): Promise<void> {
	await expectToken();
	observe(
		[
			'[data-testid="commit-row-item"]',

			'.js-commits-list-item', // `isPRCommitList`
			'.js-timeline-item .TimelineItem:has(.octicon-git-commit)', // `isPRConversation`; "js-timeline-item" excludes "isPRCommitList"
		],
		batchedFunction(markCommits, {delay: 100}),
		{signal},
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isCommitList,
		pageDetect.isPRConversation,
		pageDetect.isCompare,
	],
	init,
});

/*

Test URLs

- isPRConversation: https://github.com/refined-github/refined-github/pull/6194#event-8016526003
- isPRCommitList: https://github.com/refined-github/refined-github/pull/6194/commits
- isCommitList: https://github.com/typed-ember/ember-cli-typescript/commits/master?after=5ff0c078a4274aeccaf83382c0d6b46323f57397+174
- isCompare: https://github.com/refined-github/sandbox/compare/e8b25d3e...b3d0d992

*/
