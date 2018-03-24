import {h} from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from '../libs/page-detect';

export default function () {
	let commitUrl = location.pathname.replace(/\/$/, '');

	if (pageDetect.isPRCommit()) {
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
