import './patch-diff-links.css';
import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import {isPRCommit} from '../libs/page-detect';

function init(): void {
	let commitUrl = location.pathname.replace(/\/$/, '');

	if (isPRCommit()) {
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

features.add({
	id: 'patch-diff-links',
	include: [
		features.isCommit
	],
	load: features.onAjaxedPages,
	init
});
