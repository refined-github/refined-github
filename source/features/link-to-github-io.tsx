import React from 'dom-chef';
import {observe} from 'selector-observer';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import {LinkExternalIcon} from '@primer/octicons-react';

import features from '.';
import {getRepo} from '../github-helpers';

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

function initRepoList(): Deinit {
	return observe('a[href$=".github.io"][itemprop="name codeRepository"]:not(.rgh-github-io)', {
		constructor: HTMLAnchorElement,
		add(repoTitle) {
			repoTitle.classList.add('rgh-github-io');
			repoTitle.after(
				' ',
				getLinkToGitHubIo(repoTitle),
			);
		},
	});
}

void features.add(import.meta.url, {
	asLongAs: [
		() => Boolean(getRepo()?.name.endsWith('.github.io')),
	],
	init: initRepo,
}, {
	include: [
		pageDetect.isUserProfileRepoTab,
		pageDetect.isOrganizationProfile,
	],
	init: initRepoList,
});
