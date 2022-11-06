import * as pageDetect from 'github-url-detection';

import observe from '../helpers/selector-observer';
import features from '../feature-manager';
import {addHotkey} from '../github-helpers/hotkey';

const nextPageButtonSelectors = [
	'a.next_page', // Issue/PR list, Search, Releases
	'a.paginate-container [aria-label="Next"]', // Notifications
	'a.paginate-container > .BtnGroup > :last-child', // Commits
	'a.prh-commit > .BtnGroup > :last-child', // PR Commits
] as const;

const previousPageButtonSelectors = [
	'a.previous_page', // Issue/PR list, Search, Releases
	'a.paginate-container [aria-label="Previous"]', // Notifications
	'a.paginate-container > .BtnGroup > :first-child', // Commits
	'a.prh-commit > .BtnGroup > :first-child', // PR Commits
] as const;

function init(signal: AbortSignal): void {
	observe(nextPageButtonSelectors, button => {
		addHotkey(button, 'ArrowRight');
	}, {signal});
	observe(previousPageButtonSelectors, button => {
		addHotkey(button, 'ArrowLeft');
	}, {signal});
}

void features.add(import.meta.url, {
	shortcuts: {
		'→': 'Go to the next page',
		'←': 'Go to the previous page',
	},
	// TODO: enable for isDiscussionList after #4695 is fixed
	include: [
		pageDetect.isIssueOrPRList,
		pageDetect.isGlobalSearchResults,
		pageDetect.isLabelList,
		pageDetect.isNotifications,
		pageDetect.isRepoCommitList,
		pageDetect.isPRCommit,
		pageDetect.isUserProfileRepoTab,
	],
	init,
});

/*

# Test URLs

PR Commit: https://github.com/refined-github/refined-github/pull/4677/commits/1e1e0707ac58d1a40543a92651c3bbfd113481bf
Releases: https://github.com/refined-github/refined-github/releases
Search: https://github.com/refined-github/refined-github/search?q=pull
Issues: https://github.com/refined-github/refined-github/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc
*/
