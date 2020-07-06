import './parse-backticks.css';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {parseBackticks} from '../github-helpers/dom-formatters';

function init(): void {
	for (const title of select.all([
		'.commit-title', // `isCommit`
		'.commit-desc', // `isCommit`, `isCommitList`, `isRepoTree`
		'.commit-message', // Pushed commits in `isPRConversation`, `isCompare`, `isReleasesOrTags`
		'.message', // `isCommitList`, `isRepoTree`, `isBlame`
		'.repository-content .js-details-container .link-gray[href*="/commit/"]', // `isSingleFile`
		'.repository-content .js-details-container pre', // `isSingleFile`
		'[aria-label="Issues"][role="group"] .js-navigation-open', // `isConversationList`
		'[id^=ref-issue-]', // Issue references in `isIssue`, `isPRConversation`
		'[id^=ref-pullrequest-]', // PR references in `isIssue`, `isPRConversation`
		'.TimelineItem-body > del, .TimelineItem-body > ins', // Title edits in `isIssue`, `isPRConversation`
		'.js-pinned-issue-list-item > .d-block', // Pinned Issues
		'.pulse-section li', // `isPulse`
		'.js-recent-activity-container .text-bold', // `isDashboard`"Recent activity" titles
		'.commits blockquote', // Newsfeed commits
		'.release-header', // `isReleasesOrTags` Headers
		'[id^="check_suite"] a.link-gray-dark', // `isActions`
		'.repository-content .pr-toolbar h2', // `isActions` run
		'.Details[data-issue-and-pr-hovercards-enabled] .Details-content--hidden a:first-child', // `isRepoRoot` ("Repository refresh" layout)
		'.Details[data-issue-and-pr-hovercards-enabled] .Details-content--hidden pre', // `isRepoRoot` ("Repository refresh" layout)
		'.existing-pull-contents .list-group-item-link', // `isCompare` existing PR ("Repository refresh" layout)
		'[aria-label="Link issues"] a', // "Linked issues" in `isIssue`, `isPRConversation`
		'.notifications-list-item p.text-normal', // `isNotifications`
		'.js-wiki-sidebar-toggle-display a', // `isWiki`
		'.gh-header-title' // `isWiki`
	].map(selector => selector + ':not(.rgh-backticks-already-parsed)'))) {
		title.classList.add('rgh-backticks-already-parsed');
		parseBackticks(title);
	}
}

void features.add({
	id: __filebasename,
	description: 'Renders text in `backticks` in issue titles, commit titles and more places.',
	screenshot: 'https://user-images.githubusercontent.com/170270/55060505-31179b00-50a4-11e9-99a9-c3691ba38d66.png'
}, {
	include: [
		pageDetect.isRepo,
		pageDetect.isNotifications
	],
	init
}, {
	include: [
		pageDetect.isDashboard
	],
	onlyAdditionalListeners: true,
	init
});
