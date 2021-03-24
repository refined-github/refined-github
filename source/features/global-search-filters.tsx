import React from 'dom-chef';
import select from 'select-dom';
import {XIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '.';
import SearchQuery from '../github-helpers/search-query';
import {getUsername} from '../github-helpers';

function init(): void {
	const filters = [
		['Forks', 'fork:true'],
		['Private', 'is:private'],
		['Owned by you', 'user:' + getUsername()],
		['Authored by you', 'author:@me']
	];
	const items = [];
	for (const [name, filter] of filters) {
		const item = <a className="filter-item" href={location.href}>{name}</a>;
		const query = new SearchQuery(item as unknown as HTMLAnchorElement);

		if (query.includes(filter)) {
			query.remove(filter);
			item.classList.add('selected');
			item.prepend(<XIcon className="float-right"/>);
		} else {
			query.add(filter);
		}

		items.push(<li>{item}</li>);
	}

	select('#js-pjax-container .menu ~ .border')!.after(
		<div className="border rounded-1 p-3 mb-3 d-none d-md-block">
			<h2 className="d-inline-block f5 mb-2">
				Filters
			</h2>
			<ul data-pjax className="filter-list small">
				{items}
			</ul>
		</div>
	);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isGlobalSearchResults
	],
	init
});
