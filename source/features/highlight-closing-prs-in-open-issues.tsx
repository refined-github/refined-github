import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import observeEl from '../libs/simplified-element-observer';
import * as icons from '../libs/icons';

function add() {
	for (const infoBubble of select.all('[aria-label*="will close when"]')) {
		const prLink = select<HTMLAnchorElement>('.discussion-item-ref-title a', infoBubble.parentElement.parentElement);
		const issueNumber = select('.issue-num', prLink).textContent;
		select('.gh-header-meta .TableObject-item').after(
			<div class="TableObject-item">
				<a
					href={prLink.href}
					class="btn btn-outline btn-sm border-blue rgh-closing-pr tooltipped tooltipped-se"
					aria-label={infoBubble.getAttribute('aria-label')}>
					{icons.openPullRequest()}&nbsp;{issueNumber}
				</a>
			</div>
		);
	}
}

function init() {
	// The issue header changes when new comments are added or the issue status changes
	observeEl('.js-issues-results', add);
}

features.add({
	id: 'highlight-closing-prs-in-open-issues',
	include: [
		features.isPR,
		features.isIssue
	],
	load: features.onAjaxedPages,
	init
});
