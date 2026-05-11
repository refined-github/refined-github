import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {$$optional, $optional} from 'select-dom';

import features from '../feature-manager.js';
import LoadingIcon from '../github-helpers/icon-loading.js';
import {fetchDomUncached} from '../helpers/fetch-dom.js';
import {waitForElement} from '../helpers/selector-observer.js';

async function init(signal: AbortSignal): Promise<void> {
	if (!new URLSearchParams(location.search).has('query')) {
		return;
	}

	const nextLink = await waitForElement('a[aria-label="Next"]', {signal});
	if (!nextLink) {
		return;
	}

	const notificationList = $optional('ul.js-navigation-container');
	const paginationNav = $optional('nav[aria-label="Pagination"]');
	const paginationCounts = $optional('.js-notifications-list-paginator-counts');
	if (!notificationList || !paginationNav) {
		return;
	}

	const status = (
		<div className="d-flex flex-items-center flex-justify-center py-3">
			<LoadingIcon />
			<span className="ml-2">Loading more notifications…</span>
		</div>
	);
	paginationNav.before(status);
	paginationNav.hidden = true;
	if (paginationCounts) {
		paginationCounts.hidden = true;
	}

	let nextUrl: string = nextLink.href;

	while (nextUrl && !signal.aborted) {
		// eslint-disable-next-line no-await-in-loop
		const nextPage = await fetchDomUncached(nextUrl);
		for (const item of $$optional('.notifications-list-item', nextPage)) {
			notificationList.append(item);
		}

		nextUrl = $optional<HTMLAnchorElement>('a[aria-label="Next"]', nextPage)?.href ?? '';
	}

	paginationNav.remove();
	paginationCounts?.remove();
	status.replaceWith(
		<p className="color-fg-muted text-center py-3 f6">
			Done loading all notifications
		</p>,
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isNotifications,
	],
	init,
});

/*

Test URLs:

https://github.com/notifications?query=repo%3Aowner%2Frepo

*/
