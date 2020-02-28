// Import './pinned-issues-update-time.css';
import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import clockIcon from 'octicon/clock.svg';
import * as api from '../libs/api';
import features from '../libs/features';
import {getRepoGQL, getRepoURL} from '../libs/utils';

interface IssueInfo {
	updatedAt: string;
}

const getLastUpdated = cache.function(async (issueNumbers: string[]): Promise<Record<string, IssueInfo>> => {
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
	expiration: 1,
	cacheKey: () => __featureName__ + ':' + getRepoURL()
});

function getPinnedIssueNumber(pinnedIssue: HTMLElement): string {
	return select('.opened-by', pinnedIssue)!.firstChild!.textContent!.replace(/\D/g, '');
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
			<span className="ml-2 text-gray text-small">
				{clockIcon()} updated <relative-time datetime={updatedAt}/>
			</span>
		);
	}
}

features.add({
	id: __featureName__,
	description: 'Adds the updated time to pinned issues.',
	screenshot: false,
	include: [
		features.isRepoIssueList
	],
	load: features.onAjaxedPages,
	init
});
