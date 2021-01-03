import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import SearchQuery from '../github-helpers/search-query';
import {getUsername} from '../github-helpers';

function init(): void {
	const sourceItem = select('.subnav-search-context li:nth-last-child(2)')!;

	// Add "Everything commented by you" filter
	const commentsMenuItem = sourceItem.cloneNode(true);
	const commentsLink = select('a', commentsMenuItem)!;
	commentsLink.textContent = 'Everything commented by you';
	commentsLink.removeAttribute('target');
	new SearchQuery(commentsLink).set(`is:open commenter:${getUsername()}`);

	sourceItem.after(commentsMenuItem);

	// Add "Everything you subscribed to" link
	const subscriptionsMenuItem = commentsMenuItem.cloneNode(true);
	const subscriptionsLink = select('a', subscriptionsMenuItem)!;
	subscriptionsLink.textContent = 'Everything you subscribed to';

	const subscriptionsUrl = new URL('https://github.com/notifications/subscriptions');
	const repositoryId = select('input[name="repository_id"]')!.value;
	subscriptionsUrl.searchParams.set('repository', btoa(`010:Repository${repositoryId}`));
	subscriptionsLink.href = subscriptionsUrl.href;

	commentsMenuItem.after(subscriptionsMenuItem);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepoConversationList
	],
	init
});
