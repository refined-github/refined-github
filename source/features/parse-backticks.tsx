import './parse-backticks.css';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import observeElement from '../helpers/simplified-element-observer';
import {parseBackticks} from '../github-helpers/dom-formatters';

function parse(selectors: string[]): void {
	for (const element of select.all(selectors.map(selector => selector + ':not(.rgh-backticks-already-parsed)'))) {
		element.classList.add('rgh-backticks-already-parsed');
		parseBackticks(element);
	}
}

function initRepo(): void {
	parse([
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
		'.release-header', // `isReleasesOrTags` Headers
		'[id^="check_suite"] a.link-gray-dark', // `isActions`
		'.repository-content .pr-toolbar h2', // `isActions` run
		'.Details[data-issue-and-pr-hovercards-enabled] .Details-content--hidden a.link-gray-dark', // `isRepoRoot`
		'.Details[data-issue-and-pr-hovercards-enabled] .Details-content--hidden pre', // `isRepoRoot`
		'.Details[data-issue-and-pr-hovercards-enabled] .d-none a.link-gray-dark', // `isRepoRoot`
		'.existing-pull-contents .list-group-item-link', // `isCompare` with existing PR
		'[aria-label="Link issues"] a', // "Linked issues" in `isIssue`, `isPRConversation`
		'.BorderGrid--spacious .f4.mt-3', // `isRepoHome` repository description
		'.js-wiki-sidebar-toggle-display a', // `isWiki`
		'.gh-header-title' // `isWiki`
	]);
}

function initDashboard(): void {
	parse([
		'.js-recent-activity-container .text-bold', // `isDashboard`"Recent activity" titles
		'.commits blockquote' // Newsfeed commits
	]);
}

function initNotifications(): void {
	parse([
		'.notifications-list-item p.text-normal'
	]);
}

function initGlobalConversationList(): void {
	parse([
		'.link-gray-dark.js-navigation-open'
	]);
}

function initUserProfile(): void {
	parse([
		'.profile-timeline-card .text-gray-dark', // `isUserProfileMainTab` issue and PR title
		'[itemprop="description"]' // `isUserProfileRepoTab` repository description
	]);
}

function initHovercard(): void {
	const hovercard = select('.js-hovercard-content > .Popover-message')!;

	observeElement(hovercard, () => {
		parse([
			'.js-hovercard-content > .Popover-message .link-gray-dark'
		]);
	});
}

void features.add({
	id: __filebasename,
	description: 'Renders text in `backticks` in issue titles, commit titles and more places.',
	screenshot: 'https://user-images.githubusercontent.com/170270/55060505-31179b00-50a4-11e9-99a9-c3691ba38d66.png'
}, {
	include: [
		pageDetect.isRepo
	],
	init: initRepo
}, {
	include: [
		pageDetect.isDashboard
	],
	onlyAdditionalListeners: true,
	init: initDashboard
}, {
	include: [
		pageDetect.isNotifications
	],
	init: initNotifications
}, {
	include: [
		pageDetect.isGlobalConversationList
	],
	init: initGlobalConversationList
}, {
	include: [
		pageDetect.isUserProfile
	],
	init: initUserProfile
}, {
	init: initHovercard,
	repeatOnAjax: false
});
