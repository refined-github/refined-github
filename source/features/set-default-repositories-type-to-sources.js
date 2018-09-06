import select from 'select-dom';

export default function () {
	// Get repositories link from user profile navigation
	const link = select('.user-profile-nav a[href*="tab=repositories"]');

	if (link) {
		link.search += '&type=source';
	}
}
