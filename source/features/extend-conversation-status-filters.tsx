import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import CheckIcon from 'octicons-plain-react/Check';
import {$} from 'select-dom';

import features from '../feature-manager.js';
import SearchQuery from '../github-helpers/search-query.js';
import observe from '../helpers/selector-observer.js';
import setStatusFilter from '../helpers/set-status-filter.js';

function addMergeLink(lastLink: HTMLAnchorElement): void {
	// It's shouldn't be added in issues list
	if (!pageDetect.isPRList()) {
		return;
	}

	const locationQuery = SearchQuery.from(location);
	const isMerged = locationQuery.includes('is:merged', 'state:merged');

	// The links in `.table-list-header-toggle` are either:
	//   1 Open | 1 Closed
	//   1 Total            // Apparently appears with merged/unmerged filters
	if (isMerged) {
		// It's a "Total" link for a merged filter
		lastLink.lastChild!.textContent = lastLink.lastChild!.textContent.replace('Total', 'Merged');
		return;
	}

	const isUnmerged = locationQuery.includes('is:unmerged', '-state:merged');
	if (isUnmerged) {
		// It's a "Total" link for an unmerged filter
		lastLink.lastChild!.textContent = lastLink.lastChild!.textContent.replace('Total', 'Unmerged');
		return;
	}

	// In this case, `lastLink` is expected to be a "Closed" link
	const mergeLink = lastLink.cloneNode(true);
	mergeLink.textContent = 'Merged';
	mergeLink.classList.toggle('selected', isMerged);
	mergeLink.href = SearchQuery.from(mergeLink).replace(/(?:is|state):closed/, 'state:merged').href;
	lastLink.after(' ', mergeLink);
}

function removeAllFilters(link: HTMLAnchorElement): void {
	if (link === link.parentElement!.lastElementChild) {
		addMergeLink(link);
	}

	$('.octicon', link).remove();
	if (link.classList.contains('selected')) {
		link.prepend(<CheckIcon />);
		link.href = setStatusFilter(link, '');
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
- "Merged" view: https://github.com/sindresorhus/refined-github/pulls?q=is%3Apr+sort%3Aupdated-desc+state%3Amerged

*/
