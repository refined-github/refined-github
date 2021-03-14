import './show-forks-in-search.css';
import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import * as pageDetect from 'github-url-detection';

import features from '.';
import SearchQuery from '../github-helpers/search-query';

function init(): void {
	let includeForks = new SearchQuery(location.search).includes('fork:true');
	const checkbox = <label className="float-right"><input className="rgh-show-forks-in-search-checkbox mr-1" type="checkbox" checked={includeForks}/>Include forks</label>;
	checkbox.addEventListener('click', () => {
		includeForks = !includeForks;
		for (const link of select.all<HTMLAnchorElement>('.codesearch-results .select-menu-item')) {
			if (includeForks) {
				new SearchQuery(link).add('fork:true');
			} else {
				new SearchQuery(link).remove('fork:true');
			}

			if (link.getAttribute('aria-checked') === 'true') {
				link.click();
			}
		}
	});
	select('.codesearch-results .select-menu-title')!.after(checkbox);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isGlobalSearchResults
	],
	init
});
