import select from 'select-dom';

export default function () {
	// Get links set to repositories
	for (const link of select.all('a[href*="tab=repositories"]')) {
		// Skip pagination links
		if (!link.closest('.pagination')) {
			const search = new URLSearchParams(link.search);
			// Set default type to source if not present
			if (!search.get('type')) {
				search.set('type', 'source');
				link.search = search;
			}
		}
	}
}
