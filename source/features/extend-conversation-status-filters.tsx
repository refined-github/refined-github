import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import CheckIcon from 'octicons-plain-react/Check';
import {$, $$} from 'select-dom';

import features from '../feature-manager.js';
import SearchQuery from '../github-helpers/search-query.js';
import observe from '../helpers/selector-observer.js';
import setStatusFilter from '../helpers/set-status-filter.js';

const mergedLinkClass = 'rgh-merged-link';

function addLegacyMergeLink(lastLink: HTMLAnchorElement): void {
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
	mergeLink.classList.add(mergedLinkClass);
	mergeLink.textContent = 'Merged';
	mergeLink.classList.toggle('selected', isMerged);
	mergeLink.href = SearchQuery.from(mergeLink).replace(/(?:is|state):closed/, 'state:merged').href;
	lastLink.after(' ', mergeLink);
}

function updateLegacyStatusLink(link: HTMLAnchorElement): void {
	if (link === link.parentElement!.lastElementChild) {
		addLegacyMergeLink(link);
	}

	$('.octicon', link).remove();
	if (!link.classList.contains('selected')) {
		return;
	}

	link.prepend(<CheckIcon />);
	link.href = setStatusFilter(link, '');
}

function addMergeLink(link: HTMLAnchorElement): void {
	// In this case, `link` is expected to be a "Closed" link
	// Null if the "Merged" link hasn't been added yet
	const hasMergeLink = link.nextElementSibling?.classList.contains(mergedLinkClass);
	if (
		hasMergeLink!
		|| !SearchQuery.from(link).includes('is:closed', 'state:closed')
		|| link.classList.contains(mergedLinkClass)
	) {
		return;
	}

	const mergeLink = link.cloneNode(true);
	mergeLink.classList.add(mergedLinkClass);
	$('[class*="title"]', mergeLink).textContent = 'Merged';
	// The counter would be the one of the closed PRs
	for (const counter of $$(['[class*="count"]', '[class*="VisuallyHidden"]'], mergeLink)) {
		counter.remove();
	}

	mergeLink.href = SearchQuery.from(mergeLink).replace(/(?:is|state):closed/, 'state:merged').href;
	link.after(mergeLink);
}

function updateResultsCount(count: HTMLElement): void {
	const locationQuery = SearchQuery.from(location);

	// The header is either:
	//   Open | Closed      // Links
	//   1 results          // Apparently appears with merged/unmerged filters, in place of the links
	if (locationQuery.includes('is:merged', 'state:merged')) {
		count.textContent = count.textContent.replace('results', 'merged');
		return;
	}

	if (locationQuery.includes('is:unmerged', '-state:merged')) {
		count.textContent = count.textContent.replace('results', 'unmerged');
	}
}

function init(signal: AbortSignal): void {
	// Legacy and React list headers use different markup.
	observe('.table-list-header-toggle.states a', updateLegacyStatusLink, {signal});
	if (!pageDetect.isPRList()) {
		return;
	}

	observe('[class*="elementContainer"] > a[class*="container"][href*="state%3A"]', addMergeLink, {signal});
	observe('[data-testid="results-count"]', updateResultsCount, {signal});
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

- Regular: https://github.com/refined-github/refined-github/pulls
- "Merged" view: https://github.com/refined-github/refined-github/pulls?q=is%3Apr+sort%3Aupdated-desc+state%3Amerged
- "Unmerged" view: https://github.com/refined-github/refined-github/pulls?q=is%3Apr+sort%3Aupdated-desc+-state%3Amerged

*/
