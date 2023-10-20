import React from 'dom-chef';
import {$, $$} from 'select-dom';
import {CheckIcon} from '@primer/octicons-react';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import SearchQuery from '../github-helpers/search-query.js';

function addMergeLink(): void {
	if (!pageDetect.isPRList()) {
		return;
	}

	// The links in `.table-list-header-toggle` are either:
	//   1 Open | 1 Closed
	//   1 Total            // Apparently appears with is:merged/is:unmerged
	for (const lastLink of $$('.table-list-header-toggle.states a:last-child')) {
		const lastLinkQuery = SearchQuery.from(lastLink);

		if (lastLinkQuery.includes('is:merged')) {
			// It's a "Total" link for "is:merged"
			lastLink.lastChild!.textContent = lastLink.lastChild!.textContent.replace('Total', 'Merged');
			continue;
		}

		if (lastLinkQuery.includes('is:unmerged')) {
			// It's a "Total" link for "is:unmerged"
			lastLink.lastChild!.textContent = lastLink.lastChild!.textContent.replace('Total', 'Unmerged');
			continue;
		}

		// In this case, `lastLink` is expected to be a "Closed" link
		const mergeLink = lastLink.cloneNode(true);
		mergeLink.textContent = 'Merged';
		mergeLink.classList.toggle('selected', SearchQuery.from(location).includes('is:merged'));
		mergeLink.href = SearchQuery.from(mergeLink).replace('is:closed', 'is:merged').href;
		lastLink.after(' ', mergeLink);
	}
}

function togglableFilters(): void {
	for (const link of $$('.table-list-header-toggle.states a')) {
		$('.octicon', link)?.remove();
		if (link.classList.contains('selected')) {
			link.prepend(<CheckIcon/>);
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
}

async function init(): Promise<void | false> {
	await elementReady('.table-list-filters');

	addMergeLink();
	togglableFilters();
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoIssueOrPRList,
	],
	deduplicate: 'has-rgh-inner',
	init,
}, {
	include: [
		pageDetect.isGlobalIssueOrPRList,
	],
	deduplicate: 'has-rgh',
	init,
});
