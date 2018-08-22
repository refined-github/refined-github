import {h} from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from '../libs/page-detect';
import {getUsername} from '../libs/utils';

const repoUrl = pageDetect.getRepoURL();

export default function () {
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
