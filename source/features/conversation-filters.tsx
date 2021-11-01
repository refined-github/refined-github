import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import SearchQuery from '../github-helpers/search-query';

function init(): void {
	const sourceItem = select('#filters-select-menu a:nth-last-child(2)')!;

	// Add "Everything commented by you" filter
	const commentsLink = sourceItem.cloneNode(true);
	commentsLink.lastChild!.textContent = 'Everything commented by you';
	commentsLink.removeAttribute('target');
	new SearchQuery(commentsLink).set('is:open commenter:@me');

	sourceItem.after(commentsLink);

	// Add "Everything you subscribed to" link
	const subscriptionsLink = commentsLink.cloneNode(true);
	subscriptionsLink.lastChild!.textContent = 'Everything you subscribed to';

	const subscriptionsUrl = new URL('https://github.com/notifications/subscriptions');
	const repositoryId = select('input[name="repository_id"]')!.value;
	subscriptionsUrl.searchParams.set('repository', btoa(`010:Repository${repositoryId}`));
	subscriptionsLink.href = subscriptionsUrl.href;

	commentsLink.after(subscriptionsLink);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepoConversationList,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
