import {React} from 'dom-chef/react';
import select from 'select-dom';
import features from '../libs/features';
import {isPRCommit} from '../libs/page-detect';

function init() {
	let commitUrl = location.pathname.replace(/\/$/, '');

	if (isPRCommit()) {
		commitUrl = commitUrl.replace(/\/pull\/\d+\/commits/, '/commit');
	}

	select('.commit-meta > :last-child').append(
		<span class="sha-block patch-diff-links">
			<a href={`${commitUrl}.patch`} class="sha">patch</a>
			{ ' ' /* Workaround for: JSX eats whitespace between elements */ }
			<a href={`${commitUrl}.diff`} class="sha">diff</a>
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
