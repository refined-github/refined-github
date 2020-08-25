import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import looseParseInt from '../helpers/loose-parse-int';
import {getRepoGQL, getRepoURL} from '../github-helpers';

interface IssueInfo {
	updatedAt: string;
}

const getLastUpdated = cache.function(async (issueNumbers: number[]): Promise<Record<string, IssueInfo>> => {
	const {repository} = await api.v4(`
		repository(${getRepoGQL()}) {
			${issueNumbers.map(number => `
				${api.escapeKey(number)}: issue(number: ${number}) {
					updatedAt
				}
			`).join('\n')}
		}
	`);

	return repository;
}, {
	maxAge: {
		minutes: 30
	},
	cacheKey: ([issues]) => __filebasename + ':' + getRepoURL() + ':' + String(issues)
});

function getPinnedIssueNumber(pinnedIssue: HTMLElement): number {
	return looseParseInt(select('.opened-by', pinnedIssue)!.firstChild!.textContent!);
}

async function init(): Promise<void | false> {
	const pinnedIssues = select.all('.pinned-issue-item');
	if (pinnedIssues.length === 0) {
		return false;
	}

	const lastUpdated: Record<string, IssueInfo> = await getLastUpdated(pinnedIssues.map(getPinnedIssueNumber));
	for (const pinnedIssue of pinnedIssues) {
		const issueNumber = getPinnedIssueNumber(pinnedIssue);
		const {updatedAt} = lastUpdated[api.escapeKey(issueNumber)];
		select('.pinned-item-desc', pinnedIssue)!.append(
			' • ',
			<span className="text-gray d-inline-block">
				updated <relative-time datetime={updatedAt}/>
			</span>
		);
	}
}

void features.add({
	id: __filebasename,
	description: 'Adds the updated time to pinned issues.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/75525936-bb524700-5a4b-11ea-9225-466bda58b7de.png'
}, {
	include: [
		pageDetect.isRepoIssueList
	],
	init
});
