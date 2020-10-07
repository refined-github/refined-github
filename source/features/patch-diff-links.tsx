import './patch-diff-links.css';
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
		</span>
	);
}

void features.add({
	id: __filebasename,
	description: 'Adds links to `.patch` and `.diff` files in commits.',
	screenshot: 'https://cloud.githubusercontent.com/assets/737065/13605562/22faa79e-e516-11e5-80db-2da6aa7965ac.png'
}, {
	include: [
		pageDetect.isCommit
	],
	exclude: [
		pageDetect.isPRCommit404
	],
	init
});
