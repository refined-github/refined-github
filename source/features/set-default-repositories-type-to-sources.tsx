import select from 'select-dom';

import features from '.';

function init(): void {
	const links = select.all([
		// Pre "Repository refresh" layout
		'.user-profile-nav a[href$="tab=repositories"]', // "Your repositories" in header dropdown
		'#user-links a[href$="tab=repositories"]', // "Repositories" tab on user profile
		'.orgnav > a.pagehead-tabs-item:first-child', // "Repositories" tab on organization profile
		// "Repository refresh" layout
		'.header-nav-current-user ~ a[href$="tab=repositories"]', // "Your repositories" in header dropdown
		'[aria-label="User profile"] a[href$="tab=repositories"]', // "Repositories" tab on user profile
		'[aria-label="Organization"] a.UnderlineNav-item:first-child', // "Repositories" tab on organization profile
		'a[data-hovercard-type="organization"]' // Organization name on repo header + organization list on user profile
	]);

	for (const link of links) {
		const search = new URLSearchParams(link.search);
		search.set('type', 'source');
		link.search = String(search);
	}
}

void features.add(__filebasename, {
	init
});
