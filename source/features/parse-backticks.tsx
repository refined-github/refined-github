import './parse-backticks.css';
import {observe} from 'selector-observer';

import features from '.';
import {parseBackticks} from '../github-helpers/dom-formatters';

function init(): Deinit {
	const selectors = [
		'.BorderGrid--spacious .f4.mt-3', // `isRepoHome` repository description
		'.js-commits-list-item pre', // `isCommitList` commit description
		'.js-commit-group .pr-1 code', // `isPRConversation` commit message
		'.js-commit-group pre', // `isPRConversation` commit description
		'.release-header', // `isReleasesOrTags` Headers
		'.Box-row .mb-1 a', // `isCompare` with existing PR
		'#pull-requests a.Link--primary', // `isPulse` issue and PR title
		'[id^="check_suite"] a.Link--primary', // `isRepositoryActions`
		'.js-socket-channel[data-url*="/header_partial"] h3', // `isActions` run
		'.js-wiki-sidebar-toggle-display a', // `isWiki` sidebar pages title
		'#wiki-wrapper .gh-header-title', // `isWiki` page title
		'.issues_labeled :is(.color-text-primary, .color-fg-default) > a', // `isDashboard` "help wanted" event titles
		'#user-repositories-list [itemprop="description"]', // `isUserProfileRepoTab` repository description
		'.js-hovercard-content > .Popover-message .Link--primary', // Hovercard
		'.js-discussions-title-container h1 > .js-issue-title', // `isDiscussion`
		'a[data-hovercard-type="discussion"]', // `isDiscussionList`
	].map(selector => selector + ':not(.rgh-backticks-already-parsed)').join(',');

	return observe(selectors, {
		add(element) {
			element.classList.add('rgh-backticks-already-parsed');
			parseBackticks(element);
		},
	});
}

void features.add(import.meta.url, {
	init,
});
