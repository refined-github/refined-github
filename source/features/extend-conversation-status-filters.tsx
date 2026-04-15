import React from 'dom-chef';
import {$optional} from 'select-dom/strict.js';
import CheckIcon from 'octicons-plain-react/Check';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import SearchQuery from '../github-helpers/search-query.js';
import observe from '../helpers/selector-observer.js';

function addMergeLink(lastLink: HTMLAnchorElement): void {
	// It's shouldn't be added in issues list
	if (!pageDetect.isPRList()) {
		return;
	}

	const locationQuery = SearchQuery.from(location);
	const isMerged = locationQuery.includes('is:merged');
	const isUnmerged = locationQuery.includes('is:unmerged');

	// The links in `.table-list-header-toggle` are either:
	//   1 Open | 1 Closed
	//   1 Total            // Apparently appears with is:merged/is:unmerged
	if (isMerged) {
		// It's a "Total" link for "is:merged"
		lastLink.lastChild!.textContent = lastLink.lastChild!.textContent.replace('Total', 'Merged');
		return;
	}

	if (isUnmerged) {
		// It's a "Total" link for "is:unmerged"
		lastLink.lastChild!.textContent = lastLink.lastChild!.textContent.replace('Total', 'Unmerged');
		return;
	}

	// In this case, `lastLink` is expected to be a "Closed" link
	const mergeLink = lastLink.cloneNode(true);
	mergeLink.textContent = 'Merged';
	mergeLink.classList.toggle('selected', isMerged);
	mergeLink.href = SearchQuery.from(mergeLink).replace('is:closed', 'is:merged').href;
	lastLink.after(' ', mergeLink);
}

function removeAllFilters(link: HTMLAnchorElement): void {
	if (link === link.parentElement!.lastElementChild) {
		addMergeLink(link);
	}

	$optional('.octicon', link)?.remove();
	if (link.classList.contains('selected')) {
		link.prepend(<CheckIcon />);
		link.href = SearchQuery
			.from(link)
			.remove(
				'is:open',
				'is:closed',
				'is:merged',
				'is:unmerged',
			)
			.href;
	}
}

function init(signal: AbortSignal): void {
	observe('.table-list-header-toggle.states a', removeAllFilters, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoIssueOrPRList,
		pageDetect.isGlobalIssueOrPRList,
	],
	init,
});

/*

Test URLs:

- Regular: https://github.com/sindresorhus/refined-github/pulls
- "Merged" view: https://github.com/sindresorhus/refined-github/pulls?q=is%3Apr+sort%3Aupdated-desc+is%3Amerged

*/
