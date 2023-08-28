import './parse-backticks.css';
import onetime from 'onetime';

import observe from '../helpers/selector-observer.js';
import features from '../feature-manager.js';
import {parseBackticks} from '../github-helpers/dom-formatters.js';

// TODO: Review again, this feature presumaly should not apply to so many places
const selectors = [
	'.BorderGrid--spacious .f4.my-3', // `isRepoHome` repository description
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
	'.issues_labeled .color-fg-default > a', // `isDashboard` "help wanted" event titles
	'#user-repositories-list [itemprop="description"]', // `isProfileRepoList` repository description
	'.js-hovercard-content > .Popover-message .Link--primary', // Hovercard
	'.js-discussions-title-container h1 > .js-issue-title', // `isDiscussion`
	'a[data-hovercard-type="discussion"]', // `isDiscussionList`
	'.search-title a', // `isGlobalSearchResults` search titles
	'.notification-thread-subscription [id^="subscription_link_"]', // Subscription titles
] as const;

// No `include`, no `signal` necessary
function init(): void {
	observe(selectors, parseBackticks);
}

void features.add(import.meta.url, {
	init: onetime(init),
});

/*
Test URLs:

Commits: https://github.com/refined-github/refined-github/commits/main
isRepoSearch: https://github.com/search?q=repo%3Arefined-github%2Frefined-github+latest+reliable+button+is%3Aissue&type=Issues
isGlobalSearchResults: https://github.com/search?q=repo%3Arefined-github%2Frefined-github+is%3Aissue&type=issues
isGlobalSearchResults: https://github.com/search?q=repo%3Acommunity%2Fcommunity+backticks+in+titles&type=discussions
Subscriptions: https://github.com/notifications/subscriptions

*/
