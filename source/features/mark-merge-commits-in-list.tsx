import './mark-merge-commits-in-list.css';
import React from 'dom-chef';
import select from 'select-dom';
import {GitMergeIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

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
	return select('a.markdown-title', commit)!.pathname.split('/').pop()!;
}

async function init(): Promise<void> {
	const pageCommits = select.all('.js-commits-list-item, [data-test-selector="pr-timeline-commits-list"] .TimelineItem');
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
	],
	deduplicate: 'has-rgh-inner',
	init,
});
