import React from 'dom-chef';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import {getCleanPathname} from '../github-helpers/index.js';

async function init(): Promise<void> {
	let commitUrl = '/' + getCleanPathname();

	// Avoids a redirection
	if (pageDetect.isPRCommit()) {
		commitUrl = commitUrl.replace(/\/pull\/\d+\/commits/, '/commit');
	}

	const commitMeta = await elementReady('.commit-meta')!;
	commitMeta!.classList.remove('no-wrap'); // #5987
	commitMeta!.lastElementChild!.append(
		<span className="sha-block" data-turbo="false">
			<a href={`${commitUrl}.patch`} className="sha">patch</a>
			{' '}
			<a href={`${commitUrl}.diff`} className="sha">diff</a>
		</span>,
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isCommit,
	],
	exclude: [
		pageDetect.isPRCommit404,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
