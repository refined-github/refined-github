import './parse-backticks.css';
import onetime from 'onetime';

import observe from '../helpers/selector-observer.js';
import features from '../feature-manager.js';
import {parseBackticks} from '../github-helpers/dom-formatters.js';

const selectors = [
	// `isRepoHome` repository description
	// https://github.com/refined-github/sandbox
	'.BorderGrid--spacious .f4.my-3',

	// `isCommitList` commit description
	// https://github.com/refined-github/sandbox/commits/buncha-files/
	'.js-commits-list-item pre',

	// `isPRConversation` commit description
	// https://github.com/refined-github/sandbox/pull/55#commits-pushed-d4852bb
	'.js-commit-group pre',

	// `isReleasesOrTags` Headers
	// TODO: Fix. Not working
	// https://github.com/refined-github/sandbox/releases/tag/cool
	'.release-header',

	// `isCompare` with existing PR
	// https://github.com/refined-github/sandbox/compare/shorten-links
	'.Box-row .mb-1 a',

	// https://github.com/refined-github/refined-github/pulse
	'#pull-requests a.Link--primary',

	// https://github.com/refined-github/refined-github/actions
	'[id^="check_suite"] a.Link--primary',

	// https://github.com/refined-github/refined-github/actions/runs/6063125869
	'.js-socket-channel[data-url*="/header_partial"] h3',

	'.js-wiki-sidebar-toggle-display a', // `isWiki` sidebar pages title
	'#wiki-wrapper .gh-header-title', // `isWiki` page title

	// https://github.com/orgs/refined-github/repositories
	'#user-repositories-list [itemprop="description"]',

	// Hovercard
	// https://github.com/refined-github/sandbox/issues/72
	'.js-hovercard-content > .Popover-message .Link--primary',

	// `isGlobalSearchResults` search titles
	// https://github.com/search?q=org%3Arefined-github+testing&type=pullrequests
	'.search-title a',

	// https://github.com/notifications/subscriptions
	'.notification-thread-subscription [id^="subscription_link_"]',
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

inline

*/
