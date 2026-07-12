import React from 'dom-chef';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import {$optional, closestElement} from 'select-dom';
import {mount} from 'svelte';

import features from '../feature-manager.js';
import {isUrlReachable} from '../github-helpers/index.js';
import onetime from '../helpers/onetime.js';
import observe from '../helpers/selector-observer.js';
import NotFoundInfo from './useful-not-found-page.svelte';

function getStrikeThrough(text: string): HTMLElement {
	return <del className="color-fg-subtle">{text}</del>;
}

async function crossIfNonExistent(anchor: HTMLElement): Promise<void> {
	if (anchor instanceof HTMLAnchorElement && !await isUrlReachable(anchor.href)) {
		anchor.replaceWith(getStrikeThrough(anchor.textContent));
	}
}

async function initPrCommitOnce(): Promise<void | false> {
	const commitUrl = location.href.replace(/pull\/\d+\/(?:commits|changes)/, 'commit');
	if (!(await isUrlReachable(commitUrl))) {
		return false;
	}

	const blankSlateParagraph = await elementReady('.blankslate:has(> .octicon-telescope) p', {waitForChildren: false});
	blankSlateParagraph!.after(
		<p>
			You can also try to <a href={commitUrl}>view the detached standalone commit</a>.
		</p>,
	);
}

function addWidget(link: HTMLElement): void {
	const target = closestElement('.flex-items-center', link);

	// Remove redundant link that just points to /:user/:repo
	link.remove();

	// The branch might not exist at all
	const branch = $optional(
		// The full URL appears as "BranchName" in the error message, but it's the only child element, so exclude it
		'[data-component="BranchName"]:not(:last-child)',
		target,
	)?.textContent?.trim() ?? undefined;
	console.log('useful-not-found-page: branch', branch);

	mount(NotFoundInfo, {target, props: {branch}});
}

function init(signal: AbortSignal): void {
	if (pageDetect.isRepoTree()) {
		// Only appears on /tree/ URLs: https://github.com/fregante/GhostText/tree/3cacd7df71b097dc525d99c7aa2f54d31b02fcc8/chrome/scripts/InputArea
		observe('#repos-header-breadcrumb ol a', crossIfNonExistent, {signal});
	}

	observe(
		[
			// With repo header, missing file
			'.flex-items-center a[aria-label="go to Overview"]',
			// With repo header, missing branch
			'.flex-items-center a[aria-label="go to default branch"]',
		],
		addWidget,
		{signal},
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRCommit404,
	],
	init: onetime(initPrCommitOnce),
}, {
	include: [
		pageDetect.isRepoFile404,
	],
	requiresToken: true,
	init,
});

/*

Test URLs:

- With repo header: 404 issue: https://github.com/refined-github/refined-github/issues/888888
- With repo header: 404 file: https://github.com/refined-github/refined-github/blob/main/source/features/a-horse-with-no-name.tsx
- With repo header: 410 file: https://github.com/refined-github/refined-github/blob/main/extension/content.js
- With repo header: 410 folder: https://github.com/fregante/GhostText/tree/3cacd7df71b097dc525d99c7aa2f54d31b02fcc8/chrome/scripts/InputArea
- With repo header: 404 ref: https://github.com/refined-github/refined-github/blob/eggs-for-branch/package.json
- With PR header: 410 commit: https://github.com/refined-github/refined-github/pull/9773/changes/f3b5e710d3e363dfb1f1211e8807ac4f2366b4b8
- Raw: 404 repo: https://github.com/fregante/404-repo
- Raw: 404 user: https://github.com/__cant-find-user

*/
