import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import {getCleanPathname} from '../github-helpers';

function init(): void {
	let commitUrl = '/' + getCleanPathname();

	// Avoids a redirection
	if (pageDetect.isPRCommit()) {
		commitUrl = commitUrl.replace(/\/pull\/\d+\/commits/, '/commit');
	}

	select('.commit-meta > :last-child')!.append(
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
