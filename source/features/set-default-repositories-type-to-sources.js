import select from 'select-dom';

export default function () {
	// Get repositories link from user profile navigation
	const profileNavigation = select('.user-profile-nav:not(.is-placeholder)');
	const link = select('a[href*="tab=repositories"]', profileNavigation);
	const search = new URLSearchParams(link.search);

	// Set default type to source if not present
	if (!search.get('type')) {
		search.set('type', 'source');
		link.search = search;
	}
}
