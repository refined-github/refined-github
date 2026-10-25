import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import CheckIcon from 'octicons-plain-react/Check';
import {$, $$, $optional} from 'select-dom';

import features from '../feature-manager.js';
import SearchQuery from '../github-helpers/search-query.js';
import observe from '../helpers/selector-observer.js';
import setStatusFilter from '../helpers/set-status-filter.js';

const mergedLinkClass = 'rgh-merged-link';

function addMergeLink(closedLink: HTMLAnchorElement): void {
	// It's shouldn't be added in issues list
	if (!pageDetect.isPRList() || closedLink.nextElementSibling?.classList.contains(mergedLinkClass)) {
		return;
	}

	const mergeLink = closedLink.cloneNode(true);
	mergeLink.classList.add(mergedLinkClass);
	$('[class*="title"]', mergeLink).textContent = 'Merged';
	// The counter would be the one of the closed PRs
	for (const counter of $$(['[class*="count"]', '[class*="VisuallyHidden"]'], mergeLink)) {
		counter.remove();
	}

	mergeLink.href = SearchQuery.from(mergeLink).replace(/(?:is|state):closed/, 'state:merged').href;

	const isMerged = SearchQuery.from(location).includes('is:merged', 'state:merged');
	if (isMerged) {
		mergeLink.setAttribute('aria-current', 'true');
		// Reuse the "selected" styles of the other links, if any
		const selectedClass = [...closedLink.parentElement!.querySelectorAll('a')].flatMap(link => [...link.classList]).find(
			name => name.startsWith('selected__'),
		);
		if (selectedClass) {
			mergeLink.classList.add(selectedClass);
		}
	}

	closedLink.after(mergeLink);
}

function removeAllFilters(link: HTMLAnchorElement): void {
	const query = SearchQuery.from(link);
	if (query.includes('is:closed', 'state:closed')) {
		addMergeLink(link);
	}

	if (link.getAttribute('aria-current') !== 'true' || link.classList.contains(mergedLinkClass)) {
		return;
	}

	// Null if the icon wasn't added yet
	$optional('.octicon', link)?.remove();
	link.prepend(<CheckIcon />);
	link.href = setStatusFilter(link, '');
}

function init(signal: AbortSignal): void {
	// The Open/Closed links in the header of the list
	observe('[class*="elementContainer"] > a[class*="container"][href*="state%3A"]', removeAllFilters, {signal});
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

- Regular: https://github.com/refined-github/refined-github/issues
- Regular PRs ("Merged" link): https://github.com/refined-github/refined-github/pulls
- "Merged" view: https://github.com/refined-github/refined-github/pulls?q=is%3Apr+sort%3Aupdated-desc+state%3Amerged

*/
