import React from 'dom-chef';
import {CachedFunction} from 'webext-storage-cache';
import {$} from 'select-dom';
import batchedFunction from 'batched-function';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {getRepo} from '../github-helpers/index.js';
import looseParseInt from '../helpers/loose-parse-int.js';
import observe from '../helpers/selector-observer.js';

type IssueInfo = {
	updatedAt: string;
};

const getLastUpdated = new CachedFunction('last-updated', {
	async updater(issueNumbers: number[]): Promise<Record<string, IssueInfo>> {
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
	},
	maxAge: {minutes: 30},
	cacheKey: ([issues]) => `${getRepo()!.nameWithOwner}:${String(issues)}`,
});

function getPinnedIssueNumber(pinnedIssue: HTMLElement): number {
	return looseParseInt($('.opened-by', pinnedIssue)!.firstChild!);
}

async function update(pinnedIssues: HTMLElement[]): Promise<void> {
	const lastUpdated: Record<string, IssueInfo> = await getLastUpdated.get(pinnedIssues.map(issue => getPinnedIssueNumber(issue)));
	for (const pinnedIssue of pinnedIssues) {
		const issueNumber = getPinnedIssueNumber(pinnedIssue);
		const {updatedAt} = lastUpdated[api.escapeKey(issueNumber)];
		const originalLine = $('.opened-by', pinnedIssue)!;
		originalLine.after(
			// .rgh class enables tweakers to hide the number
			<span className="text-small color-fg-muted">
				<span className="rgh-pinned-issue-number">#{issueNumber}</span> updated <relative-time datetime={updatedAt}/>
			</span>,
		);

		originalLine.hidden = true;
	}
}

async function init(signal: AbortSignal): Promise<void> {
	observe('.pinned-issue-item', batchedFunction(update, {delay: 100}), {signal});
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
