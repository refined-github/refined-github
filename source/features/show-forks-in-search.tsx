import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';
import SearchQuery from '../github-helpers/search-query';

function init(): void {
	const includeForks = new SearchQuery(location.search).includes('fork:true');

	const checkbox = <input className="rgh-show-forks-in-search v-align-middle mr-1" type="checkbox" checked={includeForks}/>;
	delegate(document, '.rgh-show-forks-in-search', 'change', () => {
		const link = select<HTMLAnchorElement>('.codesearch-results .select-menu-item[aria-checked="true"]')!;

		if (includeForks) {
			new SearchQuery(link).remove('fork:true');
		} else {
			new SearchQuery(link).add('fork:true');
		}

		link.click();
	});

	select('.codesearch-results .select-menu-title')!.after(
		<label className="float-right">
			{checkbox}Include forks
		</label>
	);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isGlobalSearchResults
	],
	init
});
