import {h} from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from '../libs/page-detect';
import {getUsername} from '../libs/utils';

export default function () {
	const pageName = pageDetect.isGlobalIssueSearch() ? 'issues' : 'pulls';
	const username = getUsername();

	const yoursMenuItem = <a href={`/${pageName}?q=is%3Aopen+archived%3Afalse+is%3Aissue+user%3A${username}`} class="subnav-item">Yours</a>;

	if (!select.exists('.subnav-links .selected') && location.search.includes(`user%3A${username}`)) {
		yoursMenuItem.classList.add('selected');
		for (const tab of select.all(`.subnav-links a[href*="user%3A${username}"]`)) {
			tab.href = tab.href.replace(`user%3A${username}`, '');
		}
	}

	select('.subnav-links').append(yoursMenuItem);
}
