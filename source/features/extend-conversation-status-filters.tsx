import React from 'dom-chef';
import select from 'select-dom';
import CheckIcon from 'octicon/check.svg';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import SearchQuery from '../github-helpers/search-query';

function addMergeLink(): void {
	if (!pageDetect.isPRList()) {
		return;
	}

	// The links in `.table-list-header-toggle` are either:
	//   1 Open | 1 Closed
	//   1 Total            // Apparently appears with is:merged/is:unmerged
	for (const lastLink of select.all<HTMLAnchorElement>('.table-list-header-toggle.states a:last-child')) {
		const lastLinkQuery = new SearchQuery(lastLink);

		if (lastLinkQuery.includes('is:merged')) {
			// It's a "Total" link for "is:merged"
			lastLink.lastChild!.textContent = lastLink.lastChild!.textContent!.replace('Total', 'Merged');
			return;
		}

		if (lastLinkQuery.includes('is:unmerged')) {
			// It's a "Total" link for "is:unmerged"
			lastLink.lastChild!.textContent = lastLink.lastChild!.textContent!.replace('Total', 'Unmerged');
			return;
		}

		// In this case, `lastLink` is expected to be a "Closed" link
		const mergeLink = lastLink.cloneNode(true);
		mergeLink.textContent = 'Merged';
		mergeLink.classList.toggle('selected', new SearchQuery(location).includes('is:merged'));
		new SearchQuery(mergeLink).replace('is:closed', 'is:merged');
		lastLink.after(' ', mergeLink);
	}
}

function togglableFilters(): void {
	for (const link of select.all<HTMLAnchorElement>('.table-list-header-toggle.states a')) {
		select('.octicon', link)?.remove();
		if (link.classList.contains('selected')) {
			link.prepend(<CheckIcon/>);
			new SearchQuery(link).remove(
				'is:open',
				'is:closed',
				'is:merged',
				'is:unmerged'
			);
		}
	}
}

async function init(): Promise<void | false> {
	await elementReady('.table-list-filters + *');

	addMergeLink();
	togglableFilters();
}

void features.add(__filebasename, {
	include: [
		pageDetect.isConversationList
	],
	awaitDomReady: false,
	init
});
