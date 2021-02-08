import React from 'dom-chef';
import select from 'select-dom';
import {LinkExternalIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	const downloadUrl = new URL('https://useful-forks.github.io/?repo=' + pageDetect.utils.getRepoURL());

	select('#network')!.prepend(
		<a
			className="btn mt-2 mb-2"
			href={downloadUrl.href}
			target="_blank"
			rel="noreferrer"
		>
			<LinkExternalIcon className="mr-2"/>
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
