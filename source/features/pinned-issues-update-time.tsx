import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import ClockIcon from 'octicon/clock.svg';
import * as api from '../libs/api';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import {getRepoGQL, getRepoURL, looseParseInt} from '../libs/utils';

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
	maxAge: 1,
	cacheKey: () => __filebasename + ':' + getRepoURL()
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
		pinnedIssue.lastElementChild!.append(
			<span className="ml-3 text-gray"><ClockIcon/></span>,
			<span className="text-gray text-small"> Updated <relative-time datetime={updatedAt}/></span>
		);
	}
}

features.add({
	id: __filebasename,
	description: 'Adds the updated time to pinned issues.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/75525936-bb524700-5a4b-11ea-9225-466bda58b7de.png'
}, {
	include: [
		pageDetect.isRepoIssueList
	],
	init
});
