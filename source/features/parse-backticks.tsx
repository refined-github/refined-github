import './parse-backticks.css';

import onetime from '../helpers/onetime.js';
import observe from '../helpers/selector-observer.js';
import features from '../feature-manager.js';
import {parseBackticks} from '../github-helpers/dom-formatters.js';

const selectors = [
	// `isRepoHome` repository description
	// https://github.com/refined-github/sandbox
	'.Layout-sidebar .f4.my-3',

	// `isCommitList` commit description
	// https://github.com/refined-github/sandbox/commits/buncha-files/
	'.extended-commit-description-container',

	// `isPRConversation` commit description
	// https://github.com/refined-github/sandbox/pull/55#commits-pushed-d4852bb
	'.TimelineItem-body pre',

	// `isReleasesOrTags` Headers
	// https://github.com/refined-github/sandbox/releases/tag/cool
	'.Box-body h1',

	// `isCompare` with existing PR
	// https://github.com/refined-github/sandbox/compare/shorten-links
	'.Box-row .mb-1 a',

	// https://github.com/refined-github/refined-github/pulse
	'react-app[app-name="repos-pulse"] a.markdown-title',

	// https://github.com/refined-github/refined-github/actions/runs/6063125869
	'.js-socket-channel[data-url*="/header_partial"] h3',

	'.js-wiki-sidebar-toggle-display a', // `isWiki` sidebar pages title
	'#wiki-wrapper .gh-header-title', // `isWiki` page title

	// https://github.com/orgs/refined-github
	'.repo-list [itemprop="description"]',
	// https://github.com/orgs/refined-github/repositories
	'.repos-list-description',

	// `isGlobalSearchResults` search titles
	// https://github.com/search?q=org%3Arefined-github+testing&type=pullrequests
	'.search-title a',

	// https://github.com/notifications/subscriptions
	'.notification-thread-subscription [id^="subscription_link_"]',

	// Dashboard
	// https://github.com
	'a[class^="DashboardListView-module__ItemTitle"]',
	// https://github.com/orgs/refined-github/dashboard
	'.js-feed-item-component h3 > .Link--primary',
] as const;

function initOnce(): void {
	observe(selectors, parseBackticks);
}

void features.add(import.meta.url, {
	// No `include` necessary
	init: onetime(initOnce),
});

/*
Test URLs:

inline

*/
