import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import observeEl from '../libs/simplified-element-observer';
import * as icons from '../libs/icons';

function add() {
	for (const infoBubble of select.all(`
		[aria-label*="will close when"],
		[aria-label*="will close once"]
	`)) {
		const ref = infoBubble
			.closest('.discussion-item')
			.querySelector('.issue-num, .commit-id');
		const link = (ref.closest('[href]') as HTMLAnchorElement).href;

		select('.gh-header-meta .TableObject-item').after(
			<div class="TableObject-item">
				<a
					href={link}
					class="btn btn-outline btn-sm border-blue rgh-closing-pr tooltipped tooltipped-se"
					aria-label={infoBubble.getAttribute('aria-label')}>
					{ref.matches('.issue-num') ? icons.openPullRequest() : icons.commit()}
					{' ' + ref.textContent}
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
		features.isPRConversation,
		features.isIssue
	],
	load: features.onAjaxedPages,
	init
});
