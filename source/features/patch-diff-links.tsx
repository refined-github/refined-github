import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	let commitUrl = location.pathname.replace(/\/$/, '');

	if (pageDetect.isPRCommit()) {
		commitUrl = commitUrl.replace(/\/pull\/\d+\/commits/, '/commit');
	}

	select('.commit-meta > :last-child')!.append(
		<span className="sha-block patch-diff-links">
			<a href={`${commitUrl}.patch`} className="sha">patch</a>
			{ ' ' /* Workaround for: JSX eats whitespace between elements */ }
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
