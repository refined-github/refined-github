import React from 'dom-chef';
import onetime from 'onetime';
import {observe} from 'selector-observer';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import {LinkExternalIcon} from '@primer/octicons-react';

import features from '.';
import {getRepo} from '../github-helpers';

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
				</a>,
			);
		},
	});
}

async function initRepo(): Promise<void> {
	const repoTitle = await elementReady('[itemprop="name"]');
	repoTitle!.after(
		<a
			className="mr-2"
			href={`https://${repoTitle!.textContent!.trim()}`}
			target="_blank"
			rel="noopener noreferrer"
		>
			<LinkExternalIcon className="v-align-middle"/>
		</a>,
	);
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
	init: onetime(initRepoList),
});
