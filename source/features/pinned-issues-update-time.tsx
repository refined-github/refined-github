import batchedFunction from 'batched-function';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import { CachedFunction } from 'webext-storage-cache';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import { expectToken } from '../github-helpers/github-token.js';
import { getRepo } from '../github-helpers/index.js';
import looseParseInt from '../helpers/loose-parse-int.js';
import observe from '../helpers/selector-observer.js';

type IssueInfo = {
	updatedAt: string;
};

const getLastUpdated = new CachedFunction('last-updated', {
	async updater(issueNumbers: number[]): Promise<Record<string, IssueInfo>> {
		const { repository } = await api.v4(`
		repository() {
			${
			issueNumbers.map(number => `
				${api.escapeKey(number)}: issue(number: ${number}) {
					updatedAt
				}
			`).join('\n')
		}
		}
	`);

		return repository;
	},
	maxAge: { minutes: 30 },
	cacheKey: ([issues]) => `${getRepo()!.nameWithOwner}:${String(issues)}`,
});

function getPinnedIssueNumber(pinnedIssueMetadata: HTMLElement): number {
	return looseParseInt(pinnedIssueMetadata.childNodes[2]);
}

async function update(pinnedIssuesMetadata: HTMLElement[]): Promise<void> {
	const lastUpdated: Record<string, IssueInfo> = await getLastUpdated.get(
		pinnedIssuesMetadata.map(issueMetadata => getPinnedIssueNumber(issueMetadata)),
	);
	for (const issueMetadata of pinnedIssuesMetadata) {
		const issueNumber = getPinnedIssueNumber(issueMetadata);
		const { updatedAt } = lastUpdated[api.escapeKey(issueNumber)];
		issueMetadata.after(
			// .rgh class enables tweakers to hide the number
			<span className='text-small color-fg-muted'>
				<span className='rgh-pinned-issue-number'>#{issueNumber}</span> updated <relative-time datetime={updatedAt} />
			</span>,
		);

		issueMetadata.hidden = true;
	}
}

async function init(signal: AbortSignal): Promise<void> {
	await expectToken();
	observe('span[class^="PinnedIssue-module__issueMetadata"]', batchedFunction(update, { delay: 100 }), { signal });
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoIssueList,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github/issues

*/
