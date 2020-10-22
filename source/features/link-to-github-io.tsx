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
			className="mr-2"
			href={`https://${getRepositoryInfo().name!}`}
			target="_blank"
			rel="noopener noreferrer"
		>
			<LinkExternalIcon className="v-align-middle"/>
		</a>
	);
}

void features.add(__filebasename, {}, {
	include: [
		pageDetect.isRepo
	],
	exclude: [
		() => !getRepositoryInfo()!.name!.endsWith('.github.io')
	],
	init: initRepo
}, {
	include: [
		pageDetect.isUserProfileRepoTab,
		pageDetect.isOrganizationProfile
	],
	init: onetime(initRepoList)
});
