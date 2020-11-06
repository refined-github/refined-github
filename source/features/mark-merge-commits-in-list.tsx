import './mark-merge-commits-in-list.css';
import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import PullRequestIcon from 'octicon/git-pull-request.svg';

import features from '.';
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
	for (const [key, commit] of Object.entries<AnyObject>(repository)) {
		if (commit.parents.totalCount >= 2) {
			mergeCommits.push(key.slice(1));
		}
	}

	return mergeCommits;
};

// eslint-disable-next-line import/prefer-default-export
export function getCommitHash(commit: HTMLElement): string {
	return 	commit.dataset.channel!.split(':')[3] ?? // Pre "Repository refresh" layout
	commit.querySelector<HTMLAnchorElement>('a[href]')!.pathname.split('/').pop()!;
}

async function init(): Promise<void> {
	const pageCommits = select.all([
		'li.commit', // Pre "Repository refresh" layout
		'.js-commits-list-item'
	]);
	const mergeCommits = await filterMergeCommits(pageCommits.map(getCommitHash));
	for (const commit of pageCommits) {
		if (mergeCommits.includes(getCommitHash(commit))) {
			commit.classList.add('rgh-merge-commit');
			select([
				'.commit-title', // Pre "Repository refresh" layout
				'div > p'
			], commit)!.prepend(<PullRequestIcon/>);
		}
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isCommitList
	],
	init
});
