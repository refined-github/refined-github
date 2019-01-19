import select from 'select-dom';
import features from '../libs/features';

function init() {
	// Get repositories link from user profile navigation
	const link = select('.user-profile-nav a[href*="tab=repositories"]');

	if (!link) {
		return false;
	}

	link.search += '&type=source';
}

features.add({
	id: 'set-default-repositories-type-to-sources',
	include: [
		features.isUserProfile
	],
	load: features.onAjaxedPages,
	init
});
