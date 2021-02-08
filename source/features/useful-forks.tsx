import React from 'dom-chef';
import select from 'select-dom';
import {RepoForkedIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';
import {getRepo} from '../github-helpers';

import features from '.';

function init(): void {
	const downloadUrl = new URL('https://useful-forks.github.io');
	downloadUrl.searchParams.set('repo', getRepo()!.nameWithOwner);

	select('#repo-content-pjax-container')!.prepend(
		<a className="btn mt-2 mb-2 float-right" href={downloadUrl.href}>
			<RepoForkedIcon className="mr-2"/>
			Find useful forks
		</a>
	);
}

const isForksPage = (url: URL | HTMLAnchorElement | Location = location): boolean => pageDetect.utils.getRepoPath(url) === 'network/members';
const isNetworkPage = (url: URL | HTMLAnchorElement | Location = location): boolean => pageDetect.utils.getRepoPath(url) === 'network';
void features.add(__filebasename, {
	include: [
		isForksPage,
		isNetworkPage
	],
	init
});
