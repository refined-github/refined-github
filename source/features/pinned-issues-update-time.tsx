import batchedFunction from 'batched-function';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {CachedFunction} from 'webext-storage-cache';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {getRepo} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';

type IssueInfo = {
	updatedAt: string;
};

const lastUpdatedCache = new CachedFunction('last-updated', {
	async updater(issueNumbers: number[]): Promise<Record<string, IssueInfo>> {
		const {repository} = await api.v4(`
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
	maxAge: {minutes: 30},
	cacheKey: ([issues]) => `${getRepo()!.nameWithOwner}:${String(issues)}`,
});

function getPinnedIssueNumber(pinnedIssueMetadata: HTMLElement): number {
	const {issueNumber} = /#(?<issueNumber>\d+)/.exec(pinnedIssueMetadata.textContent)!.groups!;
	return Number(issueNumber);
}

async function update(pinnedIssuesMetadata: HTMLElement[]): Promise<void> {
	const issuesByNumber = new Map(pinnedIssuesMetadata.map(metadata => [getPinnedIssueNumber(metadata), metadata]));
	const lastUpdated = await lastUpdatedCache.get([...issuesByNumber.keys()]);

	for (const [issueNumber, issueMetadata] of issuesByNumber) {
		const {updatedAt} = lastUpdated[api.escapeKey(issueNumber)];
		issueMetadata.after(
			// .rgh class enables tweakers to hide the number
			<span className="text-small color-fg-muted">
				<span className="rgh-pinned-issue-number">#{issueNumber}</span> updated <relative-time datetime={updatedAt} />
			</span>,
		);

		issueMetadata.hidden = true;
	}
}

async function init(signal: AbortSignal): Promise<void> {
	observe('span[class^="PinnedIssue-module__issueMetadata"]', batchedFunction(update, {delay: 100}), {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoIssueList,
	],
	requiresToken: true,
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github/issues

*/
