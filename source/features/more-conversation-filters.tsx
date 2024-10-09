import {$} from 'select-dom';
import * as pageDetect from 'github-url-detection';
import {stringToBase64} from 'uint8array-extras';
import elementReady from 'element-ready';

import features from '../feature-manager.js';
import SearchQuery from '../github-helpers/search-query.js';

function init(): void {
	const sourceItem = $('#filters-select-menu a:nth-last-child(2)')!;

	// "Involved" filter
	const commentsLink = sourceItem.cloneNode(true);
	commentsLink.lastChild!.textContent = 'Everything you’re involved in';
	commentsLink.removeAttribute('target');
	commentsLink.href = SearchQuery.from(commentsLink).set('is:open involves:@me').href;
	commentsLink.setAttribute('aria-checked', String(commentsLink.href === location.href)); // #4589

	sourceItem.after(commentsLink);

	// "Subscribed" external link
	const searchSyntaxLink = $('#filters-select-menu a:last-child')!;
	const subscriptionsLink = searchSyntaxLink.cloneNode(true);
	subscriptionsLink.lastElementChild!.textContent = 'Everything you subscribed to';

	const subscriptionsUrl = new URL('https://github.com/notifications/subscriptions');
	const repositoryId
		= $('meta[name="octolytics-dimension-repository_id"]')?.content
		?? $('input[name="repository_id"]')!.value;
	subscriptionsUrl.searchParams.set('repository', stringToBase64(`010:Repository${repositoryId}`));
	subscriptionsLink.href = subscriptionsUrl.href;

	commentsLink.after(subscriptionsLink);
}

// The page below doesn't have the filters menu
// https://github.com/tc39/proposal-await.ops/issues?q=sort%3Aupdated-desc+is%3Aissue+is%3Aopen
async function hasFilters(): Promise<boolean> {
	return Boolean(await elementReady('#filters-select-menu', {waitForChildren: false}));
}

void features.add(import.meta.url, {
	asLongAs: [
		hasFilters,
	],
	include: [
		pageDetect.isRepoIssueOrPRList,
	],
	awaitDomReady: true,
	deduplicate: 'has-rgh-inner',
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github/issues
https://github.com/refined-github/refined-github/pulls

*/
