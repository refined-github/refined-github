import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import * as api from '../github-helpers/api';
import {getRepo} from '../github-helpers';
import looseParseInt from '../helpers/loose-parse-int';

type IssueInfo = {
	updatedAt: string;
};

const getLastUpdated = cache.function('last-updated', async (issueNumbers: number[]): Promise<Record<string, IssueInfo>> => {
	const {repository} = await api.v4(`
		repository() {
			${issueNumbers.map(number => `
				${api.escapeKey(number)}: issue(number: ${number}) {
					updatedAt
				}
			`).join('\n')}
		}
	`);

	return repository;
}, {
	maxAge: {minutes: 30},
	cacheKey: ([issues]) => `${getRepo()!.nameWithOwner}:${String(issues)}`,
});

function getPinnedIssueNumber(pinnedIssue: HTMLElement): number {
	return looseParseInt(select('.opened-by', pinnedIssue)!.firstChild!);
}

async function init(): Promise<void | false> {
	const pinnedIssues = select.all('.pinned-issue-item');
	if (pinnedIssues.length === 0) {
		return false;
	}

	const lastUpdated: Record<string, IssueInfo> = await getLastUpdated(pinnedIssues.map(issue => getPinnedIssueNumber(issue)));
	for (const pinnedIssue of pinnedIssues) {
		const issueNumber = getPinnedIssueNumber(pinnedIssue);
		const {updatedAt} = lastUpdated[api.escapeKey(issueNumber)];
		select('.pinned-item-desc', pinnedIssue)!.append(
			' • ',
			<span className="color-fg-muted d-inline-block">
				updated <relative-time datetime={updatedAt}/>
			</span>,
		);
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoIssueList,
	],
	deduplicate: 'has-rgh-inner',
	awaitDomReady: true, // TODO: Use `observe` + `batched-function`
	init,
});
