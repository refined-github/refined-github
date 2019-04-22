import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import observeEl from '../libs/simplified-element-observer';
import * as icons from '../libs/icons';

function add(): void {
	for (const infoBubble of select.all(`
		[aria-label*="will close when"],
		[aria-label*="will close once"]
	`)) {
		const ref = infoBubble
			.closest('.discussion-item')!
			.querySelector('.issue-num, .commit-id')!;
		const link = ref.closest('a')!.href;
		const isIssue = ref.classList.contains('issue-num');

		select('.gh-header-meta .TableObject-item')!.after(
			<div className="TableObject-item">
				<a
					href={link}
					className="btn btn-outline btn-sm border-blue rgh-closing-pr tooltipped tooltipped-se"
					aria-label={infoBubble.getAttribute('aria-label')!}>
					{isIssue ? icons.openPullRequest() : icons.commit()}
					{isIssue ? ' ' + ref.textContent : ''}
				</a>
			</div>
		);
	}
}

function init(): void {
	// The issue header changes when new comments are added or the issue status changes
	observeEl('.js-issues-results', add);
}

features.add({
	id: 'highlight-closing-prs-in-open-issues',
	include: [
		features.isPRConversation,
		features.isIssue
	],
	load: features.onAjaxedPages,
	init
});
