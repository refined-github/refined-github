import './parse-backticks.css';
import select from 'select-dom';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import {parseBackticks} from '../libs/dom-formatters';

function init(): void {
	for (const title of select.all([
		'.commit-title', // `isCommit`
		'.commit-desc', // `isCommit`, `isCommitList`, `isRepoTree`
		'.commit-message', // Pushed commits in `isPRConversation`, `isCompare`, `isReleasesOrTags`
		'.message', // `isCommitList`, `isRepoTree`, `isBlame`
		'.Box--condensed .link-gray[href*="/commit/"]', // `isSingleFile`
		'[aria-label="Issues"][role="group"] .js-navigation-open', // `isDiscussionList`
		'[id^=ref-issue-]', // Issue references in `isIssue`, `isPRConversation`
		'[id^=ref-pullrequest-]', // PR references in `isIssue`, `isPRConversation`
		'.TimelineItem-body > del, .TimelineItem-body > ins', // Title edits in `isIssue`, `isPRConversation`
		'.js-pinned-issue-list-item > span', // Pinned Issues
		'.pulse-section li', // `isPulse`
		'.issues_labeled .text-gray-dark > a', // `isDashboard` "help wanted" event titles
		'.js-recent-activity-container .text-bold', // `isDashboard`"Recent activity" titles
		'.commits blockquote', // Newsfeed commits
		'.release-header', // `isReleasesOrTags` Headers
		'.Box-row.js-navigation-item a.link-gray-dark', // `isGlobalDiscussionList`
		'[data-channel^="check_suites"] a', // `isActions`
		'.repository-content .pr-toolbar h2', // `isActions` run
		'#wiki-wrapper h1' // `isWiki`
	].map(selector => selector + ':not(.rgh-backticks-already-parsed)'))) {
		title.classList.add('rgh-backticks-already-parsed');
		parseBackticks(title);
	}
}

features.add({
	id: __filebasename,
	description: 'Renders text in `backticks` in issue titles and commit titles/descriptions.',
	screenshot: 'https://user-images.githubusercontent.com/170270/55060505-31179b00-50a4-11e9-99a9-c3691ba38d66.png'
}, {
	include: [
		pageDetect.isRepo
	],
	init
}, {
	include: [
		pageDetect.isDashboard
	],
	onlyAdditionalListeners: true,
	init
});
