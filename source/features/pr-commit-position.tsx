import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {$$, closestElement} from 'select-dom';
import {CachedFunction} from 'webext-storage-cache';

import features from '../feature-manager.js';
import {buildRepoUrl, getCleanPathname, getConversationNumber} from '../github-helpers/index.js';
import {fetchDomUncached} from '../helpers/fetch-dom.js';
import observe from '../helpers/selector-observer.js';

const buttonGroup = '[class^="prc-ButtonGroup-ButtonGroup"]';

// GitHub shows at most 250 commits per PR, all on a single unpaginated page
async function getCommits(commitsUrl: string): Promise<string[]> {
	const list = await fetchDomUncached(commitsUrl + '/commits');
	const linkPrefix = new URL(commitsUrl).pathname + '/changes/';

	// Each row links the commit by title and by hash, the heading picks one of the two
	return $$(`h4 a[href^="${linkPrefix}"]`, list)
		.map(link => link.getAttribute('href')!.slice(linkPrefix.length));
}

const commitHashes = new CachedFunction('pr-commit-hashes', {
	updater: getCommits,
	maxAge: {hours: 1},
});

async function add(navigationLink: HTMLAnchorElement): Promise<void> {
	const commits = await commitHashes.get(buildRepoUrl('pull', getConversationNumber()!));
	const position = commits.indexOf(getCleanPathname().split('/').pop()!);
	if (position === -1) {
		// Commits past the 250th aren't listed, so they can't be counted
		if (commits.length === 250) {
			return;
		}

		throw new Error('The commit is missing from the PR’s commit list, the PR might have changed since the last fetch');
	}

	closestElement(buttonGroup, navigationLink).after(
		<span className="float-right flex-self-center color-fg-muted mx-2 tmp-mx-2 no-wrap">
			{position + 1} of {commits.length} commits
		</span>,
	);
}

function init(signal: AbortSignal): void {
	// Both buttons match, but the group only needs one counter
	observe(`${buttonGroup} a[aria-label$="commit" i]`, add, {signal, once: true});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRCommit,
	],
	init,
});

/*

Test URLs:

Commit 2 in a 251-commit PR: https://github.com/refined-github/sandbox/pull/165/changes/99ba8b70177b398046f214702d6a537ae8ba825a

*/
