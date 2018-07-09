import {h} from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from '../libs/page-detect';

export default function () {
	function openAll() {
		select.all('.link-gray-dark').forEach(link => {
			window.open(link.href);
		});
	}

	const buttonText = pageDetect.isIssueSearch() ? `Open all issues` : `Open all PRs`;
	const openAllButton = <button id="openAllButton" onClick={openAll} class="btn btn-primary float-right rgh-open-all-issues-button" role="button" data-hotkey="o">{buttonText}</button>;

	if (select.exists('.issues-listing') && select.all('.link-gray-dark').length !== 0) {
		select('.issues-listing>.subnav').append(openAllButton);
	}
}
