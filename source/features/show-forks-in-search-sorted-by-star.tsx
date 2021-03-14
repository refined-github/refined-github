import select from 'select-dom';
import onetime from 'onetime';
import * as pageDetect from 'github-url-detection';

import features from '.';
import SearchQuery from '../github-helpers/search-query';

function init(): void {
	const option =  select<HTMLAnchorElement>('.codesearch-results .select-menu-item:nth-of-type(2)')!;
	const query =		new SearchQuery(option);
	query.add('fork:true');
	select('#codesearch_sort_repos option:nth-of-type(2)')!.value = `/search?${query.searchParams.toString()}`;
}

void features.add(__filebasename, {
	include: [
		pageDetect.isGlobalSearchResults
	],
	init: onetime(init)
});
