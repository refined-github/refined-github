import select from 'select-dom';

export default function () {
	// Get repositories link from user profile navigation
	const link = select('.user-profile-nav:not(.is-placeholder) a[href*="tab=repositories"]');
	const search = new URLSearchParams(link.search);

	// Set default type to source if not present
	if (!search.get('type')) {
		search.set('type', 'source');
		link.search = search;
	}
}
