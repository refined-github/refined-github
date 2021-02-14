import './parse-backticks.css';
import onetime from 'onetime';
import {observe} from 'selector-observer';
import zipTextNodes from 'zip-text-nodes';

import features from '.';
import {parseBackticks} from '../github-helpers/dom-formatters';
import parseBackticksCore from '../github-helpers/parse-backticks';

function init(): void {
	const selectors = [
		'.BorderGrid--spacious .f4.mt-3', // `isRepoHome` repository description
		'.js-commits-list-item .mb-1', // `isCommitList` commit message
		'.js-commits-list-item pre', // `isCommitList` commit description
		'.Details[data-issue-and-pr-hovercards-enabled] .d-none a.link-gray-dark', // `isRepoRoot` commit message
		'.commit-title', // `isCommit` commit message
		'.commit-desc', // `isCommit` commit description
		'.js-commit .pr-1 > code', // `isPRConversation` pushed commits
		'.js-details-container .pr-1 > code', // `isCompare` pushed commits
		'.Box-row .mb-1 a', // `isCompare` open Pull Request title
		'.blame-commit-message', // `isBlame` commit message
		'a[id^="issue_"]', // `isConversationList` issue and PR title
		'.TimelineItem-body > del', // `isIssue`, `isPRConversation` title edits
		'.TimelineItem-body > ins', // `isIssue`, `isPRConversation` title edits
		'[id^=ref-issue-]', // `isIssue` issue and PR references
		'[id^=ref-pullrequest-]', // `isPRConversation` issue and PR references
		'[aria-label="Link issues"] a', // `isIssue`, `isPRConversation` linked issue and PR
		'.Box-header.Details .link-gray', // `isSingleFile` commit message
		'.Box-header.Details pre', // `isSingleFile` commit description
		'.js-pinned-issue-list-item > .d-block', // Pinned Issues
		'.release-header', // `isReleasesOrTags` Headers
		'.existing-pull-contents .list-group-item-link', // `isCompare` with existing PR
		'#pull-requests a.link-gray-dark', // `isPulse` issue and PR title
		'[id^="check_suite"] a.link-gray-dark', // `isRepositoryActions`
		'.checks-summary-conclusion + .flex-auto .f3', // `isActions` run
		'.js-wiki-sidebar-toggle-display a', // `isWiki` sidebar pages title
		'.wiki-wrapper .gh-header-title', // `isWiki` page title
		'.js-recent-activity-container .text-bold', // `isDashboard` "Recent activity" titles
		'.issues_labeled .text-gray-dark > a', // `isDashboard` "help wanted" event titles
		'.commits blockquote', // `isDashboard` newsfeed commits
		'.notifications-list-item p.text-normal', // `isNotifications` issue and PR title
		'.profile-timeline-card .text-gray-dark', // `isUserProfileMainTab` issue and PR title
		'#user-repositories-list [itemprop="description"]', // `isUserProfileRepoTab` repository description
		'.js-hovercard-content > .Popover-message .link-gray-dark', // Hovercard
		'.js-issue-title', // `isSingleDiscussion`
		'a[data-hovercard-type="discussion"]' // `isDiscussionList`
	].map(selector => selector + ':not(.rgh-backticks-already-parsed)').join();

	observe(selectors, {
		add(element) {
			element.classList.add('rgh-backticks-already-parsed');
			parseBackticks(element);
		}
	});

	// `isRepoSearch` might highlight keywords inside backticks, breaking the regular dom-formatter #3509
	observe('.codesearch-results .f4:not(.rgh-backticks-already-parsed)', {
		add(element) {
			element.classList.add('rgh-backticks-already-parsed');
			zipTextNodes(element, parseBackticksCore(element.textContent!));
		}
	});
}

void features.add(__filebasename, {
	init: onetime(init)
});
