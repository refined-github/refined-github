import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {LinkIcon} from '@primer/octicons-react';

import features from '../feature-manager';
import {getRepo} from '../github-helpers';
import observe from '../helpers/selector-observer';

function getLinkToGitHubIo(repoTitle: HTMLElement, className?: string): JSX.Element {
	return (
		<a
			href={`https://${repoTitle.textContent!.trim().replace(/com$/, 'io')}`}
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
	include: [
		pageDetect.hasRepoHeader,
	],
	asLongAs: [
		() => /\.github\.(io|com)$/.test(getRepo()?.name ?? 'shush eslint'),
	],
	init: initRepo,
}, {
	include: [
		pageDetect.isUserProfileRepoTab,
		pageDetect.isOrganizationProfile,
	],
	init: initRepoList,
});
