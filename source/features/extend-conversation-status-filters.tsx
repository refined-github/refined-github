import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import SearchQuery from '../github-helpers/search-query.js';
import observe from '../helpers/selector-observer.js';

function getFilterState(): {isMerged: boolean; isUnmerged: boolean} {
	const locationQuery = SearchQuery.from(location);

	return {
		isMerged: locationQuery.includes('is:merged'),
		isUnmerged: locationQuery.includes('is:unmerged'),
	};
}

function addMergeLink(lastLink: HTMLAnchorElement): void {
	// It's shouldn't be added in issues list
	if (!pageDetect.isPRList()) {
		return;
	}

	const {isMerged, isUnmerged} = getFilterState();

	if (isMerged) {
		// It's a "Total" link for "is:merged"
		lastLink.lastChild!.textContent = lastLink.lastChild!.textContent.replace('Total', 'Merged');
	} else if (isUnmerged) {
		// It's a "Total" link for "is:unmerged"
		lastLink.lastChild!.textContent = lastLink.lastChild!.textContent.replace('Total', 'Unmerged');
	} else {
		// In this case, `lastLink` is expected to be a "Closed" link
		const mergeLink = lastLink.cloneNode(true);
		mergeLink.textContent = 'Merged';
		mergeLink.classList.toggle('selected', isMerged);
		// If link is selected, the filters are already removed
		mergeLink.href = lastLink.classList.contains('selected') ? SearchQuery.from(mergeLink).append('is:merged').href : SearchQuery.from(mergeLink).replace('is:closed', 'is:merged').href;
		lastLink.after(' ', mergeLink);
	}
}

function removeAllFilters(link: HTMLAnchorElement): void {
	if (link.classList.contains('selected')) {
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
	observe('.table-list-header-toggle.states a:last-child', addMergeLink, {signal});
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
