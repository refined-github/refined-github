import React from 'dom-chef';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import {LinkExternalIcon} from '@primer/octicons-react';

import features from '../feature-manager';
import {getRepo} from '../github-helpers';
import observe from '../helpers/selector-observer';

function getLinkToGitHubIo(repoTitle: HTMLElement): JSX.Element {
	return (
		<a
			href={`https://${repoTitle.textContent!.trim()}`}
			target="_blank"
			rel="noopener noreferrer"
		>
			<LinkExternalIcon className="v-align-middle"/>
		</a>
	);
}

async function initRepo(): Promise<void> {
	const repoTitle = (await elementReady('[itemprop="name"]'))!;
	const link = getLinkToGitHubIo(repoTitle);

	link.classList.add('mr-2');
	repoTitle.after(link);
}

function addLink(repoTitle: HTMLAnchorElement): void {
	repoTitle.after(' ', getLinkToGitHubIo(repoTitle));
}

function initRepoList(signal: AbortSignal): void {
	observe('a[href$=".github.io"][itemprop="name codeRepository"]', addLink, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		() => Boolean(getRepo()?.name.endsWith('.github.io')),
	],
	deduplicate: 'has-rgh',
	init: initRepo,
}, {
	include: [
		pageDetect.isUserProfileRepoTab,
		pageDetect.isOrganizationProfile,
	],
	deduplicate: 'has-rgh',
	init: initRepoList,
});
