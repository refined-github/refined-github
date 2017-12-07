import {h} from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from '../libs/page-detect';
import {getUsername} from '../libs/utils';

const repoUrl = pageDetect.getRepoURL();

export default function () {
	if (select.exists('.refined-github-filter')) {
		return;
	}
	select('.subnav-search-context .js-navigation-item:last-child')
		.before(
			<a
				href={`/${repoUrl}/issues?q=is%3Aopen+commenter:${getUsername()}`}
				class="select-menu-item js-navigation-item refined-github-filter">
				<div class="select-menu-item-text">
					Everything commented by you
				</div>
			</a>
		);
}
