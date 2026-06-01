import SearchQuery from '../github-helpers/search-query.js';

export function setStatusFilter(link: HTMLAnchorElement, status?: string): string {
	const query = SearchQuery
		.from(link)
		.remove(
			'is:draft',
			'is:open',
			'is:closed',
			'state:draft',
			'state:open',
			'state:closed',
			'is:merged',
			'state:merged',
			'is:unmerged',
			'-state:merged',
		);

	if (status) {
		query.append(status);
	}

	return query.href;
}
