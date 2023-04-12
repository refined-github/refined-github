import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import SearchQuery from '../github-helpers/search-query';

function init(): void {
	const sourceItem = select('#filters-select-menu a:nth-last-child(2)')!;

	// "Involved" filter
	const commentsLink = sourceItem.cloneNode(true);
	commentsLink.lastChild!.textContent = 'Everything you’re involved in';
	commentsLink.removeAttribute('target');
	commentsLink.href = SearchQuery.from(commentsLink).set('is:open involves:@me').href;
	commentsLink.setAttribute('aria-checked', String(commentsLink.href === location.href)); // #4589

	sourceItem.after(commentsLink);

	// "Subscribed" link
	const subscriptionsLink = select('#filters-select-menu a:last-child')!.cloneNode(true);
	subscriptionsLink.lastElementChild!.textContent = 'Everything you subscribed to';

	const subscriptionsUrl = new URL('https://github.com/notifications/subscriptions');
	const repositoryId = select('meta[name="octolytics-dimension-repository_id"]')!.content;
	subscriptionsUrl.searchParams.set('repository', btoa(`010:Repository${repositoryId}`));
	subscriptionsLink.href = subscriptionsUrl.href;

	commentsLink.after(subscriptionsLink);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoIssueOrPRList,
	],
	awaitDomReady: true,
	deduplicate: 'has-rgh-inner',
	init,
});
