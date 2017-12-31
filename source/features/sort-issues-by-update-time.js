import select from 'select-dom';
import {anySelector} from '../libs/utils';

export default function () {
	// Get issues links that don't already have a specific sorting applied
	for (const link of select.all(anySelector(`
		:any(
			[href*="/issues"],
			[href*="/pulls"]
		):not([href*="sort%3A"]):not(.issues-reset-query)
	`))) {
		// Pick only links to lists, not single issues
		if (/(issues|pulls)\/?$/.test(link.pathname)) {
			const search = new URLSearchParams(link.search);
			const queries = (search.get('q') || '').split(' ');

			// The /issues/ listings will also include PRs unless `is:issue` is specified
			if (/(issues)\/?$/.test(link.pathname) && !queries.includes('is:pr')) {
				queries.push('is:issue');
			}

			// Add sorting last
			queries.push('sort:updated-desc');

			search.set('q', queries.join(' ').trim());
			link.search = search;
		}
	}
}
