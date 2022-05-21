import React from 'dom-chef';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import {RepoForkedIcon} from '@primer/octicons-react';

import features from '.';
import {getRepo} from '../github-helpers';
import looseParseInt from '../helpers/loose-parse-int';

async function init(): Promise<void | false> {
	// TODO [2022-06-01]: Remove `.social-count` (GHE)
	const forkCount = await elementReady('#repo-network-counter, .social-count[href$="/network/members"]');
	if (looseParseInt(forkCount) === 0) {
		return false;
	}

	const downloadUrl = new URL('https://useful-forks.github.io');
	downloadUrl.searchParams.set('repo', getRepo()!.nameWithOwner);

	const selector = pageDetect.isRepoForksList() ? '#network' : '#repo-content-pjax-container h2';
	const container = await elementReady(selector, {waitForChildren: false});
	container!.prepend(
		<a className="btn mb-2 float-right" href={downloadUrl.href}>
			<RepoForkedIcon className="mr-2"/>
			Find useful forks
		</a>,
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoForksList,
		pageDetect.isRepoNetworkGraph,
	],
	exclude: [
		pageDetect.isEnterprise,
	],
	awaitDomReady: false,
	init,
});
