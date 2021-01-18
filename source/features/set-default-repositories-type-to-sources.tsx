import select from 'select-dom';

import features from '.';
import onProfileDropdownLoad from '../github-events/on-profile-dropdown-load';

function addSourceTypeToLink(link: HTMLAnchorElement): void {
	const search = new URLSearchParams(link.search);
	search.set('type', 'source');
	link.search = String(search);
}

async function init(): Promise<void> {
	const links = select.all([
		// Pre "Repository refresh" layout
		'#user-links a[href$="tab=repositories"]', // "Repositories" tab on user profile
		'.orgnav > a.pagehead-tabs-item:first-child', // "Repositories" tab on organization profile
		// "Repository refresh" layout
		'[aria-label="User profile"] a[href$="tab=repositories"]', // "Repositories" tab on user profile
		'[aria-label="Organization"] a.UnderlineNav-item:first-child', // "Repositories" tab on organization profile
		'a[data-hovercard-type="organization"]' // Organization name on repo header + organization list on user profile
	]);

	for (const link of links) {
		addSourceTypeToLink(link);
	}

	// "Your repositories" in header dropdown
	await onProfileDropdownLoad();
	addSourceTypeToLink(select('.header-nav-current-user ~ a[href$="tab=repositories"]')!);
}

void features.add(__filebasename, {
	init
});
