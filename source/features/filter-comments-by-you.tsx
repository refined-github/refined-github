import select from 'select-dom';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import {getUsername} from '../libs/utils';
import SearchQuery from '../libs/search-query';

function init(): void {
	// Use an existing dropdown item to preserve its DOM structure (supports old GHE versions)
	const sourceItem = select<HTMLAnchorElement>([
		'#filters-select-menu a:nth-last-child(2)', // GHE
		'.subnav-search-context li:nth-last-child(2)'
	])!;

	const menuItem = sourceItem.cloneNode(true);
	const link = select('a', menuItem) ?? menuItem;
	link.textContent = 'Everything commented by you';
	link.removeAttribute('target');
	new SearchQuery(link).set(`is:open commenter:${getUsername()}`);

	sourceItem.after(menuItem);
}

features.add({
	id: __filebasename,
	description: 'Adds a `Everything commented by you` filter in the search box dropdown.',
	screenshot: 'https://user-images.githubusercontent.com/170270/27501170-f394a304-586b-11e7-92d8-d92d6922356b.png'
}, {
	include: [
		pageDetect.isRepoDiscussionList
	],
	init
});
