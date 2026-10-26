import * as pageDetect from 'github-url-detection';
import {$, $$} from 'select-dom';

import features from '../feature-manager.js';
import SearchQuery from '../github-helpers/search-query.js';
import observe from '../helpers/selector-observer.js';

const mergedLinkClass = 'rgh-merged-link';

function addMergeLink(link: HTMLAnchorElement): void {
	// In this case, `link` is expected to be a "Closed" link
	// Null if the "Merged" link hasn't been added yet
	const hasMergeLink = link.nextElementSibling?.classList.contains(mergedLinkClass);
	if (
		!SearchQuery.from(link).includes('is:closed', 'state:closed') || link.classList.contains(mergedLinkClass)
		|| hasMergeLink
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
	// The Open/Closed links in the header of the list
	observe('[class*="elementContainer"] > a[class*="container"][href*="state%3A"]', addMergeLink, {signal});
	observe('[data-testid="results-count"]', updateResultsCount, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRList,
	],
	init,
});

/*

Test URLs:

- Regular: https://github.com/refined-github/refined-github/pulls
- "Merged" view: https://github.com/refined-github/refined-github/pulls?q=is%3Apr+sort%3Aupdated-desc+state%3Amerged
- "Unmerged" view: https://github.com/refined-github/refined-github/pulls?q=is%3Apr+sort%3Aupdated-desc+-state%3Amerged

*/
