import React from 'dom-chef';
import onetime from 'onetime';
import {observe} from 'selector-observer';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import LinkExternalIcon from 'octicon/link-external.svg';

import features from '.';
import {getRepositoryInfo} from '../github-helpers';

function initRepoList(): void {
	observe('a[href$=".github.io"][itemprop="name codeRepository"]:not(.rgh-github-io)', {
		constructor: HTMLAnchorElement,
		add(repository) {
			repository.classList.add('rgh-github-io');
			repository.after(
				' ',
				<a
					href={`https://${repository.textContent!.trim()}`}
					target="_blank"
					rel="noopener noreferrer"
				>
					<LinkExternalIcon className="v-align-middle"/>
				</a>
			);
		}
	});
}

async function initRepo(): Promise<void> {
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
		pageDetect.isRepo
	],
	exclude: [
		() => !getRepositoryInfo()!.name!.endsWith('.github.io')
	],
	init: initRepo
}, {
	include: [
		pageDetect.isUserProfileRepoTab
	],
	init: onetime(initRepoList)
});
