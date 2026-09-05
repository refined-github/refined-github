import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {$, $$optional} from 'select-dom';

import features from '../feature-manager.js';
import {buildRepoUrl, getConversationNumber} from '../github-helpers/index.js';
import fetchDom from '../helpers/fetch-dom.js';
import observe from '../helpers/selector-observer.js';

// GitHub shows at most 250 commits per PR, all on a single unpaginated page
async function getCommits(): Promise<string[]> {
	const list = await fetchDom(buildRepoUrl('pull', getConversationNumber()!, 'commits'));

	// The old PR view links commits as `/commits/:hash`, the new one as `/changes/:hash`
	const hashes = $$optional('a[href*="/commits/"], a[href*="/changes/"]', list)
		.map(link => link.getAttribute('href')!.split('/').pop()!)
		.filter(hash => /^[\da-f]{40}$/.test(hash));

	// Each commit is linked twice: by title and by hash
	return [...new Set(hashes)];
}

async function add(navigationLink: HTMLAnchorElement): Promise<void> {
	const commits = await getCommits();
	const position = commits.indexOf(location.pathname.split('/').pop()!) + 1;
	if (position === 0) {
		return;
	}

	// Each button counts the commits it can still take you through
	const isPrevious = navigationLink.dataset.hotkey === 'p' || /previous/i.test(navigationLink.ariaLabel ?? '');
	const remaining = isPrevious ? position - 1 : commits.length - position;

	// The count goes inside the label: an extra element in the group would wrap, and one
	// next to the label would be auto-placed in Primer's grid, before the text
	$([
		'[class*="Button-label" i]', // Also matches Primer React's `prc-Button-Label-*`
		'[data-component="text"]',
	], navigationLink).append(<span className="color-fg-muted"> ({remaining})</span>);
}

function init(signal: AbortSignal): void {
	observe([
		'a[data-hotkey="p"], a[data-hotkey="n"]', // Legacy
		'a[aria-label$="commit" i]',
	], add, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRCommit,
	],
	init,
});
