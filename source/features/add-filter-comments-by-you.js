import {h} from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import {getRepoURL} from '../libs/page-detect';
import {getUsername} from '../libs/utils';

const repoUrl = getRepoURL();

function init() {
	select('.subnav-search-context li:last-child')
		.before(
			<li>
				<a
					href={`/${repoUrl}/issues?q=is%3Aopen+commenter:${getUsername()}`}
					class="select-menu-item"
					role="menuitem">
						Everything commented by you
				</a>
			</li>
		);
}

features.add({
	id: 'add-filter-comments-by-you',
	include: [
		features.isIssueList
	],
	load: features.onAjaxedPages,
	init
});
