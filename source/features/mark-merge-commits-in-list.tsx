import './mark-merge-commits-in-list.css';
import React from 'dom-chef';
import select from 'select-dom';
import {GitMergeIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';
import {objectEntries} from 'ts-extras';

import features from '../feature-manager';
import * as api from '../github-helpers/api';

const filterMergeCommits = async (commits: string[]): Promise<string[]> => {
	const {repository} = await api.v4(`
		repository() {
			${commits.map((commit: string) => `
				${api.escapeKey(commit)}: object(expression: "${commit}") {
				... on Commit {
						parents {
							totalCount
						}
					}
				}
			`).join('\n')}
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
	return select('a.markdown-title', commit)!.pathname.split('/').pop()!;
}

async function init(): Promise<void> {
	const pageCommits = select.all([
		'.js-commits-list-item', // `isCommitList`
		'.js-timeline-item .TimelineItem:has(.octicon-git-commit)', // `isPRConversation`, "js-timeline-item" to exclude "isCommitList"
	].join(','));

	if (pageCommits.length === 0) {
		throw new Error('No commits found, selector likely out of date');
	}

	const mergeCommits = await filterMergeCommits(pageCommits.map(commit => getCommitHash(commit)));
	for (const commit of pageCommits) {
		if (mergeCommits.includes(getCommitHash(commit))) {
			commit.classList.add('rgh-merge-commit');
			select('a.markdown-title', commit)!.before(<GitMergeIcon className="mr-1"/>);
		}
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isCommitList,
		pageDetect.isPRConversation,
		pageDetect.isCompare,
	],
	deduplicate: 'has-rgh-inner',
	init,
});

/*

Test URLs

- isPRConversation: https://github.com/refined-github/refined-github/pull/6194
- isPRCommitList: https://github.com/refined-github/refined-github/pull/6194/commits
- isCommitList: https://github.com/babel/babel/commits/master?after=ddd40bf5c7ad8565fc990f26142f85613958a329+104
- isCompare: https://github.com/refined-github/sandbox/compare/e8b25d3e...b3d0d992

*/
