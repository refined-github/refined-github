import React from 'dom-chef';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import {RepoForkedIcon} from '@primer/octicons-react';

import features from '.';
import {getRepo} from '../github-helpers';
import looseParseInt from '../helpers/loose-parse-int';

async function init(): Promise<void> {
	if (looseParseInt((await elementReady('.social-count[href$="/network/members"]', {waitForChildren: false}))!) > 0) {
		const downloadUrl = new URL('https://useful-forks.github.io');
		downloadUrl.searchParams.set('repo', getRepo()!.nameWithOwner);

		const selector = isForksPage() ? '#network' : '#repo-content-pjax-container h2';
		(await elementReady(selector, {waitForChildren: false}))!.prepend(
			<a className="btn mb-2 float-right" href={downloadUrl.href}>
				<RepoForkedIcon className="mr-2"/>
				Find useful forks
			</a>
		);
	}
}

const isForksPage = (url: URL | HTMLAnchorElement | Location = location): boolean => pageDetect.utils.getRepoPath(url) === 'network/members';
const isNetworkPage = (url: URL | HTMLAnchorElement | Location = location): boolean => pageDetect.utils.getRepoPath(url) === 'network';
void features.add(__filebasename, {
	include: [
		isForksPage,
		isNetworkPage
	],
	awaitDomReady: false,
	init
});
