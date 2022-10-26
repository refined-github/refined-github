import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {LinkExternalIcon} from '@primer/octicons-react';

import features from '../feature-manager';
import {getRepo} from '../github-helpers';
import observe from '../helpers/selector-observer';

function getLinkToGitHubIo(repoTitle: HTMLElement, className?: string): JSX.Element {
	return (
		<a
			href={`https://${repoTitle.textContent!.trim()}`}
			target="_blank"
			rel="noopener noreferrer"
			className={className}
		>
			<LinkExternalIcon className="v-align-middle"/>
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
	observe('a[href$=".github.io"][itemprop="name codeRepository"]', addRepoListLink, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRepoHeader,
	],
	asLongAs: [
		() => Boolean(getRepo()?.name.endsWith('.github.io')),
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
