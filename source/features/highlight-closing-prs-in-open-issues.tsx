import './highlight-closing-prs-in-open-issues.css';
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
		const isCommit = !infoBubble.getAttribute('aria-label')!.includes('commit');
		let ref;
		let link;
		if (isCommit) {
			ref = infoBubble
				.closest('.TimelineItem-body')!
				.querySelector('a span')!;
			link = ref.closest('a')!.href;
		} else {
			ref = select('.commit-message .issue-keyword a')! as HTMLAnchorElement;
			link = ref.href;
		}

		select('.gh-header-meta .TableObject-item')!.after(
			<div className="TableObject-item">
				<a
					href={link}
					className="btn btn-outline btn-sm border-blue rgh-closing-pr tooltipped tooltipped-se"
					aria-label={infoBubble.getAttribute('aria-label')!}>
					{isCommit ? icons.openPullRequest() : icons.commit()}
					{isCommit ? ' ' + ref.textContent! : ''}
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
	id: __featureName__,
	description: 'Add link to an issue’s closing commit or pull request.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/37037746-8b8eac8a-2185-11e8-94f6-4d50a9c8a152.png',
	include: [
		features.isPRConversation,
		features.isIssue
	],
	load: features.onAjaxedPages,
	init
});
