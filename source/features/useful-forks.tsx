import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import {RepoForkedIcon} from '@primer/octicons-react';

import features from '.';
import {getRepo} from '../github-helpers';
import looseParseInt from '../helpers/loose-parse-int';

function init(): void {
	if (hasNoForks()) {
		return;
	}

	const downloadUrl = new URL('https://useful-forks.github.io');
	downloadUrl.searchParams.set('repo', getRepo()!.nameWithOwner);

	const selector = isForksListPage() ? '#network' : '#repo-content-pjax-container h2';
	select(selector)!.prepend(
		<a className="btn mb-2 float-right" href={downloadUrl.href}>
			<RepoForkedIcon className="mr-2"/>
			Find useful forks
		</a>
	);
}

function hasNoForks(): boolean {
	const forksAmount = looseParseInt(select('.social-count[href$="/network/members"]')!);
	return forksAmount === 0;
}

function isForksListPage(): boolean {
	return getRepo()!.path.includes('members');
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
