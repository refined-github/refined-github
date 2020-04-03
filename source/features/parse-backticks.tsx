import elementReady from 'element-ready';
import './parse-backticks.css';
import select from 'select-dom';
import features from '../libs/features';
import {parseBackticks} from '../libs/dom-formatters';

function initGeneral(): void {
	for (const title of select.all([
		'.commit-title', // `isCommit`
		'.commit-desc', // `isCommit`, `isCommitList`, `isRepoTree`
		'.commit-message', // Pushed commits in `isPRConversation`
		'.message', // `isCommitList`, `isRepoTree`
		'.Box--condensed .link-gray[href*="/commit/"]', // `isSingleFile`
		'[aria-label="Issues"][role="group"] .js-navigation-open', // `isDiscussionList`
		'[id^=ref-issue-]', // Issue references in `isIssue`, `isPRConversation`
		'[id^=ref-pullrequest-]', // PR references in `isIssue`, `isPRConversation`
		'.TimelineItem-body > del, .TimelineItem-body > ins', // Title edits in `isIssue`, `isPRConversation`
		'.js-pinned-issue-list-item > span' // Pinned Issues
	])) {
		parseBackticks(title);
	}
}

// Highlight code in issue/PR titles on Dashboard page ("Recent activity" container)
async function initDashboard(): Promise<void> {
	await elementReady('.js-recent-activity-container', {stopOnDomReady: false});
	for (const title of select.all('.js-recent-activity-container .text-bold')) {
		parseBackticks(title);
	}
}

features.add({
	id: __featureName__,
	description: 'Renders text in `backticks` in issue titles and commit titles/descriptions.',
	screenshot: 'https://user-images.githubusercontent.com/170270/55060505-31179b00-50a4-11e9-99a9-c3691ba38d66.png'
}, {
	include: [
		features.isCommit,
		features.isCommitList,
		features.isDiscussionList,
		features.isIssue,
		features.isPRConversation,
		features.isRepoTree,
		features.isSingleFile
	],
	load: features.onAjaxedPages,
	init: initGeneral
}, {
	include: [
		features.isDashboard
	],
	load: features.onDocumentStart,
	init: initDashboard
});
