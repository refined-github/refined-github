import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {LinkIcon} from '@primer/octicons-react';

import features from '../feature-manager';
import {getRepo} from '../github-helpers';
import observe from '../helpers/selector-observer';

function getLinkToGitHubIo(repoTitle: HTMLElement, className?: string): JSX.Element {
	return (
		<a
			href={`https://${repoTitle.textContent!.trim()}`}
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
	// Also consider any old GitHub Pages repo like: resume/resume.github.com , issue: https://github.com/refined-github/refined-github/issues/6228
	observe(':is(a[href$=".github.io"], a[href$=".github.com"])[itemprop="name codeRepository"]', addRepoListLink, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRepoHeader,
	],
	asLongAs: [
		() => Boolean(getRepo()?.name.endsWith('.github.io')) || Boolean(getRepo()?.name.endsWith('.github.com')),
	],
	awaitDomReady: false,
	init: initRepo,
}, {
	include: [
		pageDetect.isUserProfileRepoTab,
		pageDetect.isOrganizationProfile,
	],
	awaitDomReady: false,
	init: initRepoList,
});
