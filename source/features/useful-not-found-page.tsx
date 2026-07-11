import React from 'dom-chef';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
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

function init(signal: AbortSignal): void {
	observe('main', container => {
		mount(NotFoundInfo, {target: container});
	}, {signal});
}

function initRepoFile(signal: AbortSignal): void {
	observe('#repos-header-breadcrumb-wide-heading + ol a', crossIfNonExistent, {signal});
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

void features.add(import.meta.url, {
	asLongAs: [
		pageDetect.is404,
	],
	requiresToken: true,
	init,
}, {
	include: [
		pageDetect.isPRCommit404,
	],
	init: onetime(initPrCommitOnce),
}, {
	include: [
		pageDetect.isRepoFile404,
	],
	requiresToken: true,
	init: initRepoFile,
});

/*

Test URLs:

- 404 issue: https://github.com/refined-github/refined-github/issues/888888
- 404 file: https://github.com/refined-github/refined-github/blob/main/source/features/a-horse-with-no-name.tsx
- 410 file: https://github.com/refined-github/refined-github/blob/main/extension/content.js
- 404 ref: https://github.com/refined-github/refined-github/blob/eggs-for-branch/package.json

*/
