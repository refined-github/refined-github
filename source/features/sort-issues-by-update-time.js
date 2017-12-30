import select from 'select-dom';

export default function () {
	// Get issues links that don't already have a specific sorting applied
	for (const link of select.all(`
		[href*="/issues"]:not([href*="sort%3A"]),
		[href*="/pulls"]:not([href*="sort%3A"])
	`)) {
		// Pick only links to lists, not single issues
		if (/(issues|pulls)\/?$/.test(link.pathname)) {
			const search = new URLSearchParams(link.search);
			const queries = search.get('q') || '';
			search.set('q', (queries + 'sort:updated-desc').trim());
			link.search = search;
		}
	}
}
