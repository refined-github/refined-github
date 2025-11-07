import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import {getCleanPathname} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';

function getCommitUrl(extension: 'patch' | 'diff'): string {
	// The replacement avoids a redirection isPRCommit
	const pathname = getCleanPathname().replace(/\/pull\/\d+\/commits/, '/commit');
	return `/${pathname}.${extension}`;
}

function updateCommitUrl(
	event: React.FocusEvent<HTMLAnchorElement> | React.MouseEvent<HTMLAnchorElement>,
): void {
	const link = event.currentTarget;
	link.href = getCommitUrl(link.textContent as 'patch' | 'diff');
}

function createLink(type: 'patch' | 'diff'): JSX.Element {
	return (
		<a
			href={getCommitUrl(type)}
			className="sha color-fg-default"
			// Update URL because it might be out of date due to SPA navigation
			// https://github.com/refined-github/refined-github/issues/8737
			onMouseEnter={updateCommitUrl}
			onFocus={updateCommitUrl}
		>
			{type}
		</a>
	);
}

async function addPatchDiffLinks(commitMeta: HTMLElement): Promise<void> {
	commitMeta.classList.remove('no-wrap'); // #5987
	commitMeta.prepend(
		<span className="sha-block" data-turbo="false">
			{createLink('patch')}
			{' '}
			{createLink('diff')}
			{commitMeta.tagName !== 'DIV' && <span className="px-2">·</span>}
		</span>,
	);
}

async function init(signal: AbortSignal): Promise<void> {
	observe([
		'.commit-meta > :is(span, div):last-child', // `isPRCommit` + old `isSingleCommit`
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
