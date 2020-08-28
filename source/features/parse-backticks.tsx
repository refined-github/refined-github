import './parse-backticks.css';
import onetime from 'onetime';
import {observe} from 'selector-observer';
import zipTextNodes from 'zip-text-nodes';

import features from '.';
import {parseBackticks} from '../github-helpers/dom-formatters';

function init(): void {
	const selectors = [
		'.BorderGrid--spacious .f4.mt-3', // `isRepoHome` repository description
		'.js-commits-list-item .mb-1, .js-commits-list-item pre', // `isCommitList` commit message and description
		'.Details[data-issue-and-pr-hovercards-enabled] .d-none a.link-gray-dark', // `isRepoRoot` commit message
		'.commit-title, .commit-desc', // `isCommit` commit message and description
		'.commit-message', // `isPRConversation`, `isCompare`, `isReleasesOrTags` pushed commits
		'.blame-commit-message', // `isBlame` commit message
		'a[id^="issue_"]', // `isConversationList` issue and PR title
		'.TimelineItem-body > del, .TimelineItem-body > ins', // `isIssue`, `isPRConversation` title edits
		'[id^=ref-issue-], [id^=ref-pullrequest-]', // `isIssue`, `isPRConversation` issue and PR references
		'[aria-label="Link issues"] a', // `isIssue`, `isPRConversation` linked issue and PR
		'.Box-header.Details .link-gray, .Box-header.Details pre', // `isSingleFile` commit message and description
		'.js-pinned-issue-list-item > .d-block', // Pinned Issues
		'.release-header', // `isReleasesOrTags` Headers
		'.existing-pull-contents .list-group-item-link', // `isCompare` with existing PR
		'#pull-requests a.link-gray-dark', // `isPulse` issue and PR title
		'[id^="check_suite"] a.link-gray-dark', // `isActions`
		'.checks-summary-conclusion + .flex-auto .f3', // `isActions` run
		'.js-wiki-sidebar-toggle-display a', // `isWiki` sidebar pages title
		'.wiki-wrapper .gh-header-title', // `isWiki` page title
		'.js-recent-activity-container .text-bold', // `isDashboard` "Recent activity" titles
		'.issues_labeled .text-gray-dark > a', // `isDashboard` "help wanted" event titles
		'.commits blockquote', // `isDashboard` newsfeed commits
		'.notifications-list-item p.text-normal', // `isNotifications` issue and PR title
		'.profile-timeline-card .text-gray-dark', // `isUserProfileMainTab` issue and PR title
		'#user-repositories-list [itemprop="description"]', // `isUserProfileRepoTab` repository description
		'.js-hovercard-content > .Popover-message .link-gray-dark' // Hovercard
	].map(selector => selector + ':not(.rgh-backticks-already-parsed)').join();

	observe(selectors, {
		add(element) {
			element.classList.add('rgh-backticks-already-parsed');
			parseBackticks(element);
		}
	});

	// `isRepoSearch`
	observe('#issue_search_results .f4:not(.rgh-backticks-already-parsed)', {
		add(element) {
			const child = element.firstElementChild!;
			const clone = element.cloneNode(true);
			// Combine text content to enable backticks parsing
			child.textContent = `${child.textContent!}`;

			element.classList.add('rgh-backticks-already-parsed');
			parseBackticks(element);

			zipTextNodes(element, clone);
		}
	});
}

void features.add({
	id: __filebasename,
	description: 'Renders text in `backticks` in issue titles, commit titles and more places.',
	screenshot: 'https://user-images.githubusercontent.com/170270/55060505-31179b00-50a4-11e9-99a9-c3691ba38d66.png'
}, {
	init: onetime(init)
});
