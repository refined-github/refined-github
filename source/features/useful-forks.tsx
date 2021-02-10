import React from 'dom-chef';
import elementReady from 'element-ready';
import {isRepoForksList, isRepoNetworkGraph} from 'github-url-detection';
import {RepoForkedIcon} from '@primer/octicons-react';

import features from '.';
import {getRepo} from '../github-helpers';
import looseParseInt from '../helpers/loose-parse-int';

async function init(): Promise<void | false> {
	const forkCount = looseParseInt((await elementReady('.social-count[href$="/network/members"]', {waitForChildren: false}))!);
	if (forkCount === 0) {
		return false;
	}

	const downloadUrl = new URL('https://useful-forks.github.io');
	downloadUrl.searchParams.set('repo', getRepo()!.nameWithOwner);

	const selector = isRepoForksList() ? '#network' : '#repo-content-pjax-container h2';
	(await elementReady(selector, {waitForChildren: false}))!.prepend(
		<a className="btn mb-2 float-right" href={downloadUrl.href}>
			<RepoForkedIcon className="mr-2"/>
			Find useful forks
		</a>
	);
}

void features.add(__filebasename, {
	include: [
		isRepoForksList,
		isRepoNetworkGraph
	],
	awaitDomReady: false,
	init
});
