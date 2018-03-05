import {h} from 'dom-chef';
import select from 'select-dom';
import * as icons from '../libs/icons';

export default function () {
	if (select.exists('.rgh-closing-pr')) {
		return;
	}
	for (const pr of select.all('[aria-label*="will close once pull request"]')) {
		const prLink = select('a', pr.nextElementSibling);
		const issueNumber = select('.issue-num', prLink).textContent;
		select('.gh-header-meta .TableObject-item').after(
			<div class="TableObject-item">
				<a href={prLink.href} class="btn btn-outline btn-sm border-blue rgh-closing-pr">
					{icons.openPullRequest()}&nbsp;{issueNumber}
				</a>
			</div>
		);
	}
}
