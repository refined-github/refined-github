import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {getCleanPathname} from '../github-helpers';

function init(): void {
	let commitUrl = '/' + getCleanPathname();

	// Avoids a redirection
	if (pageDetect.isPRCommit()) {
		commitUrl = commitUrl.replace(/\/pull\/\d+\/commits/, '/commit');
	}

	select('.commit-meta > :last-child')!.append(
		<span className="sha-block">
			<a data-skip-pjax href={`${commitUrl}.patch`} className="sha">patch</a>
			{ ' ' /* Workaround for: JSX eats whitespace between elements */ }
			<a data-skip-pjax href={`${commitUrl}.diff`} className="sha">diff</a>
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
