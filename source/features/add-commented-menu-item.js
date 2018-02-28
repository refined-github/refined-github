import {h} from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from '../libs/page-detect';
import {getUsername} from '../libs/utils';

export default function () {
	const pageName = pageDetect.isIssueSearch() ? 'issues' : 'pulls';
	const type = pageDetect.isIssueSearch() ? 'issue' : 'pr';
	const username = getUsername();

	if (select.exists('.refined-github-commented')) {
		return;
	}

	const commentedMenuItem = <a href={`/${pageName}?q=is%3Aopen+is%3A${type}+commenter%3A${username}`} class="subnav-item refined-github-commented">Commented</a>;

	if (!select.exists('.subnav-links .selected') && location.search.includes(`commenter%3A${username}`)) {
		commentedMenuItem.classList.add('selected');
		for (const tab of select.all(`.subnav-links a[href*="commenter%3A${username}"]`)) {
			tab.href = tab.href.replace(`commenter%3A${username}`, '');
		}
	}

	select('.subnav-links').append(commentedMenuItem);
}
