import './mark-merge-commits-in-list.css';
import React from 'dom-chef';
import {$, $$} from 'select-dom';
import * as pageDetect from 'github-url-detection';
import {objectEntries} from 'ts-extras';
import {FeedMergedIcon} from '@primer/octicons-react';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {isHasSelectorSupported} from '../helpers/select-has.js';

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

function getCommitLink(commit: HTMLElement): HTMLAnchorElement | undefined {
	return $([
		'a.markdown-title', // Old view style (before November 2023)
		'.markdown-title a',
	], commit);
}

export function getCommitHash(commit: HTMLElement): string {
	return getCommitLink(commit)!.pathname.split('/').pop()!;
}

async function init(): Promise<void> {
	const pageCommits = $$([
		'.listviewitem',

		// Old view style (before November 2023)
		'.js-commits-list-item', // `isCommitList`
		'.js-timeline-item .TimelineItem:has(.octicon-git-commit)', // `isPRConversation`, "js-timeline-item" to exclude "isCommitList"
	]);

	if (pageCommits.length === 0) {
		throw new Error('No commits found, selector likely out of date');
	}

	const mergeCommits = await filterMergeCommits(pageCommits.map(commit => getCommitHash(commit)));
	for (const commit of pageCommits) {
		if (mergeCommits.includes(getCommitHash(commit))) {
			commit.classList.add('rgh-merge-commit');
			getCommitLink(commit)!.before(<FeedMergedIcon/>);
		}
	}
}

void features.add(import.meta.url, {
	asLongAs: [
		isHasSelectorSupported,
	],
	include: [
		pageDetect.isCommitList,
		pageDetect.isPRConversation,
		pageDetect.isCompare,
	],
	deduplicate: 'has-rgh-inner',
	awaitDomReady: true, // TODO: Use `observe` + `batched-function`
	init,
});

/*

Test URLs

- isPRConversation: https://github.com/refined-github/refined-github/pull/6194
- isPRCommitList: https://github.com/refined-github/refined-github/pull/6194/commits
- isCommitList: https://github.com/typed-ember/ember-cli-typescript/commits/master?after=5ff0c078a4274aeccaf83382c0d6b46323f57397+174
- isCompare: https://github.com/refined-github/sandbox/compare/e8b25d3e...b3d0d992

*/
