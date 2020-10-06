import select from 'select-dom';

import features from '.';

function init(): void {
	const links = select.all<HTMLAnchorElement>([
		// Pre "Repository refresh" layout
		'.user-profile-nav [href$="tab=repositories"]', // "Your repositories" in header dropdown
		'#user-links [href$="tab=repositories"]', // "Repositories" tab on user profile
		'.orgnav > .pagehead-tabs-item:first-child', // "Repositories" tab on organization profile
		// "Repository refresh" layout
		'.header-nav-current-user ~ [href$="tab=repositories"]', // "Your repositories" in header dropdown
		'[aria-label="User profile"] [href$="tab=repositories"]', // "Repositories" tab on user profile
		'[aria-label="Organization"] .UnderlineNav-item:first-child', // "Repositories" tab on organization profile
		'[data-hovercard-type="organization"]' // Organization name on repo header + organization list on user profile
	]);

	for (const link of links) {
		const search = new URLSearchParams(link.search);
		search.set('type', 'source');
		link.search = String(search);
	}
}

void features.add({
	id: __filebasename,
	description: 'Hides forks and archived repos from profiles (but they can still be shown).',
	screenshot: 'https://user-images.githubusercontent.com/1402241/45133648-fe21be80-b1c8-11e8-9052-e38cb443efa9.png',
	testOn: ''
}, {
	init
});
