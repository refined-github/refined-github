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
		'.release-header', // `isReleasesOrTags` Headers
		'.Box-row .mb-1 a', // `isCompare` with existing PR
		'#pull-requests a.link-gray-dark', // `isPulse` issue and PR title (GHE #4021)
		'#pull-requests a.Link--primary', // `isPulse` issue and PR title
		'[id^="check_suite"] a.link-gray-dark', // `isRepositoryActions` (GHE #4021)
		'[id^="check_suite"] a.Link--primary', // `isRepositoryActions`
		'.js-socket-channel[data-url*="/header_partial"] h3', // `isActions` run
		'.js-wiki-sidebar-toggle-display a', // `isWiki` sidebar pages title
		'#wiki-wrapper .gh-header-title', // `isWiki` page title
		'.issues_labeled .text-gray-dark > a', // `isDashboard` "help wanted" event titles (GHE #4021)
		'.issues_labeled .color-text-primary > a', // `isDashboard` "help wanted" event titles
		'.commits blockquote', // `isDashboard` newsfeed commits
		'#user-repositories-list [itemprop="description"]', // `isUserProfileRepoTab` repository description
		'.js-hovercard-content > .Popover-message .link-gray-dark', // Hovercard (GHE #4021)
		'.js-hovercard-content > .Popover-message .Link--primary', // Hovercard
		'.js-discussions-title-container h1 > .js-issue-title', // `isDiscussion`
		'a[data-hovercard-type="discussion"]', // `isDiscussionList`
	].map(selector => selector + ':not(.rgh-backticks-already-parsed)').join(',');

	observe(selectors, {
		add(element) {
			element.classList.add('rgh-backticks-already-parsed');
			parseBackticks(element);
		},
	});
}

void features.add(__filebasename, {
	init: onetime(init),
});
