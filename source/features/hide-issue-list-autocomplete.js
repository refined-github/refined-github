import select from 'select-dom';
import * as pageDetect from '../libs/page-detect';

export default function () {
	if (pageDetect.isIssueList()) {
		const searchBar = select('.subnav-search');
		searchBar.setAttribute('autocomplete', 'off');
	}
}
