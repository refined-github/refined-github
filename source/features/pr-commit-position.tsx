import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {$$optional, closestElement} from 'select-dom';
import {CachedFunction} from 'webext-storage-cache';

import features from '../feature-manager.js';
import {buildRepoUrl, cacheByRepo, getCleanPathname, getConversationNumber} from '../github-helpers/index.js';
import {fetchDomUncached} from '../helpers/fetch-dom.js';
import observe from '../helpers/selector-observer.js';

const buttonGroup = '[class^="prc-ButtonGroup-ButtonGroup"]';

// GitHub shows at most 250 commits per PR, all on a single unpaginated page
async function getCommits(): Promise<string[]> {
	const list = await fetchDomUncached(buildRepoUrl('pull', getConversationNumber()!, 'commits'));

	// The old PR view links commits as `/commits/:hash`, the new one as `/changes/:hash`
	const hashes = $$optional('a[href*="/commits/"], a[href*="/changes/"]', list)
		.map(link => link.getAttribute('href')!.split('/').pop()!)
		.filter(hash => /^[\da-f]{40}$/.test(hash));

	// Each commit is linked twice: by title and by hash
	return [...new Set(hashes)];
}

// A PR can gain commits while it's being reviewed
const commitHashes = new CachedFunction('pr-commit-hashes', {
	updater: getCommits,
	maxAge: {hours: 1},
	cacheKey: () => `${cacheByRepo()}:${getConversationNumber()}`,
});

async function add(navigationLink: HTMLAnchorElement): Promise<void> {
	const commits = await commitHashes.get();
	const position = commits.indexOf(getCleanPathname().split('/').pop()!) + 1;
	if (position === 0) {
		return;
	}

	closestElement(buttonGroup, navigationLink).after(
		<span className="rgh-pr-commit-position float-right flex-self-center color-fg-muted mx-2 tmp-mx-2 no-wrap">
			{position} of {commits.length} commits
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

Third of 23 commits: https://github.com/mavlink/mavlink-camera-manager/pull/594/commits/a02ae36205b66468223d521504ef6c44a443c597
Same commit in the new PR view: https://github.com/mavlink/mavlink-camera-manager/pull/594/changes/a02ae36205b66468223d521504ef6c44a443c597
Last of 23 commits: https://github.com/mavlink/mavlink-camera-manager/pull/594/commits/7774e1e625c69d458633cc0760d472fd40f8a4d5
Single-commit PR, GitHub drops the navigation buttons so nothing is added: https://github.com/refined-github/sandbox/pull/10/commits/a34a1812612a03774cd1acfb39ee90acc72b0bde

*/
