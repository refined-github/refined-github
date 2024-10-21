import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import {getCleanPathname} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';

async function addPatchDiffLinks(commitMeta: HTMLElement): Promise<void> {
	let commitUrl = '/' + getCleanPathname();

	// Avoids a redirection
	if (pageDetect.isPRCommit()) {
		commitUrl = commitUrl.replace(/\/pull\/\d+\/commits/, '/commit');
	}

	commitMeta!.classList.remove('no-wrap'); // #5987
	commitMeta!.prepend(
		<span className="sha-block ml-2" data-turbo="false">
			<a href={`${commitUrl}.patch`} className="sha color-fg-default">patch</a>
			{' '}
			<a href={`${commitUrl}.diff`} className="sha color-fg-default">diff</a>
		</span>,
		<span className="px-2">·</span>,
	);
}

async function init(signal: AbortSignal): Promise<void> {
	observe([
		'.commit-meta > span:last-child', // TODO remove in March 2025
		'[class*="commit-header-actions"] + div pre',
	], addPatchDiffLinks, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isCommit,
	],
	exclude: [
		pageDetect.isPRCommit404,
	],
	init,
});

/*

Test URLs:

- Commit:https://github.com/refined-github/refined-github/commit/132272786fdc058193e089d8c06f2a158844e101
- PR Commit: https://github.com/refined-github/refined-github/pull/7751/commits/07ddf838c211075701e9a681ab061a158b05ee79

*/
