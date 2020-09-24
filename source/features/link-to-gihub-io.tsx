import React from 'dom-chef';
import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import LinkExternalIcon from 'octicon/link-external.svg';

import features from '.';
import {getRepositoryInfo} from '../github-helpers';

function repoListInit(): void {
	for (const repo of select.all<HTMLAnchorElement>('a[href$=".github.io"][itemprop="name codeRepository"]')) {
		repo.after(
			' ',
			<a
				href={`https://${repo.textContent!.trim()}`}
				target="_blank"
				rel="noopener noreferrer"
			>
				<LinkExternalIcon className="v-align-middle"/>
			</a>
		);
	}
}

async function repoInit(): Promise<void> {
	const repoTitle = await elementReady('[itemprop="name"]')!;
	repoTitle!.after(
		<a
			href={`https://${getRepositoryInfo().name!}`}
			target="_blank"
			rel="noopener noreferrer"
		>
			<LinkExternalIcon className="v-align-middle"/>
		</a>
	);
}

void features.add({
	id: __filebasename,
	description: 'Add a link to visit the user’s github.io website from its repo.',
	screenshot: 'https://user-images.githubusercontent.com/31387795/94045261-dbcd5e80-fdec-11ea-83fa-30bb673cc26e.jpg'
}, {
	include: [
		pageDetect.isUserProfileRepoTab
	],
	init: repoListInit
}, {
	include: [
		pageDetect.isRepo
	],
	exclude: [
		() => !getRepositoryInfo()!.name!.endsWith('.github.io')
	],
	init: repoInit
});
