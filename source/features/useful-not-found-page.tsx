import './useful-not-found-page.css';

import React from 'dom-chef';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import {mount} from 'svelte';

import features from '../feature-manager.js';
import {getCleanPathname, isUrlReachable} from '../github-helpers/index.js';
import onetime from '../helpers/onetime.js';
import observe from '../helpers/selector-observer.js';
import NotFoundInfo from './useful-not-found-page.svelte';
import GitHubFileUrl from '../github-helpers/github-file-url.js';

function getStrikeThrough(text: string): HTMLElement {
	return <del className="color-fg-subtle">{text}</del>;
}

async function crossIfNonExistent(anchor: HTMLElement): Promise<void> {
	if (anchor instanceof HTMLAnchorElement && !await isUrlReachable(anchor.href)) {
		anchor.replaceWith(getStrikeThrough(anchor.textContent));
	}
}

function addWidget(container: HTMLElement): void {
	mount(NotFoundInfo, {target: container.parentElement!});
}

async function addDirectCommitLinkOnce(): Promise<void | false> {
	const commitUrl = location.origin + '/' + getCleanPathname().replace(/pull\/\d+\/(?:commits|changes)/, 'commit');
	if (!(await isUrlReachable(commitUrl))) {
		return false;
	}

	const commitHash = new GitHubFileUrl(commitUrl).branch.slice(0, 8);
	const blankSlateParagraph = await elementReady('.blankslate:has(> .octicon-telescope) p', {waitForChildren: false});
	blankSlateParagraph!.after(
		<p>
			<span className="commit-ref"><a href={commitUrl}>{commitHash}</a></span> exists outside of this pull request.
		</p>,
	);
}

function crossTreeBreadcrumbs(signal: AbortSignal): void {
	observe('#repos-header-breadcrumb ol a', crossIfNonExistent, {signal});
}

function init(signal: AbortSignal): void {
	observe([
		// 410 file
		// Typo in GitHub's code
		'div[data-testid="eror-404-description"]',

		// 404 ref
		'div[data-testid="error-404-description"]',
	], addWidget, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		pageDetect.is404,
	],
	include: [
		pageDetect.isSingleFile,
		pageDetect.isRepoTree,
	],
	requiresToken: true,
	init,
}, {
	asLongAs: [
		pageDetect.is404,
		pageDetect.isRepoTree,
	],
	// No token required.
	// Only appears on /tree/ URLs:
	// https://github.com/fregante/GhostText/tree/3cacd7df71b097dc525d99c7aa2f54d31b02fcc8/chrome/scripts/InputArea
	init: crossTreeBreadcrumbs,
}, {
	include: [
		pageDetect.isPRCommit404,
	],
	init: onetime(addDirectCommitLinkOnce),
});

/*

Test URLs:

- 404 file: https://github.com/refined-github/refined-github/blob/main/source/features/a-horse-with-no-name.tsx
- 410 file: https://github.com/refined-github/refined-github/blob/main/source/features/highest-rated-comment.tsx
- 301 file: https://github.com/refined-github/refined-github/blob/main/extension/content.js
- 404 folder (native breadcrumbs): https://github.com/fregante/GhostText/tree/3cacd7df71b097dc525d99c7aa2f54d31b02fcc8/chrome/scripts/InputArea
- 404 ref: https://github.com/refined-github/refined-github/blob/eggs-for-branch/package.json
- 410 PR commit: https://github.com/refined-github/refined-github/pull/9773/changes/f3b5e710d3e363dfb1f1211e8807ac4f2366b4b8

*/
