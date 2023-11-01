import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {LinkIcon} from '@primer/octicons-react';

import features from '../feature-manager.js';
import {getRepo} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';

function getLinkToGitHubIo(repoTitle: HTMLElement, className?: string): JSX.Element {
	return (
		<a
			href={`https://${repoTitle.textContent.trim().replace(/com$/, 'io')}`}
			className={className}
		>
			<LinkIcon className="v-align-middle"/>
		</a>
	);
}

function addRepoListLink(repoTitle: HTMLAnchorElement): void {
	repoTitle.after(' ', getLinkToGitHubIo(repoTitle));
}

function addRepoHeaderLink(repoTitle: HTMLElement): void {
	repoTitle.after(getLinkToGitHubIo(repoTitle, 'mr-2'));
}

function initRepo(signal: AbortSignal): void {
	observe('[itemprop="name"]', addRepoHeaderLink, {signal});
}

function initRepoList(signal: AbortSignal): void {
	observe([
		// Earlier GitHub Pages were hosted on github.com #6228
		'a[itemprop="name codeRepository"][href$=".github.com"]',
		'a[itemprop="name codeRepository"][href$=".github.io"]',
	], addRepoListLink, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		() => /\.github\.(io|com)$/.test(getRepo()?.name ?? 'shush eslint'),
	],
	include: [
		pageDetect.isRepoHome,
	],
	init: initRepo,
}, {
	include: [
		pageDetect.isProfileRepoList,
		pageDetect.isOrganizationProfile,
	],
	init: initRepoList,
});

/*

Test URLs:

- Repo: https://github.com/yashshah1/yashshah1.github.io
- List, user: https://github.com/yashshah1?tab=repositories&q=GitHub.io&type=source
- List, org: https://github.com/Qv2ray?q=GitHub.io

*/
