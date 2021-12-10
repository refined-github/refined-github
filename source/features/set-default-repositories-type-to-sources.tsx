import select from 'select-dom';
import onetime from 'onetime';
import * as pageDetect from 'github-url-detection';

import features from '.';
import onProfileDropdownLoad from '../github-events/on-profile-dropdown-load';

function addSourceTypeToLink(link: HTMLAnchorElement): void {
	const search = new URLSearchParams(link.search);
	search.set('type', 'source');
	link.search = String(search);
}

async function profileDropdown(): Promise<void> {
	await onProfileDropdownLoad();
	addSourceTypeToLink(select('.header-nav-current-user ~ a[href$="tab=repositories"]')!); // "Your repositories" in header dropdown
}

async function init(): Promise<void> {
	const links = select.all([
		'[aria-label="User profile"] a[href$="tab=repositories"]', // "Repositories" tab on user profile
		'[aria-label="Organization"] [data-tab-item="org-header-repositories-tab"] a', // "Repositories" tab on organization profile
		'a[data-hovercard-type="organization"]', // Organization name on repo header + organization list on user profile
	]);

	for (const link of links) {
		addSourceTypeToLink(link);
	}
}

void features.add(import.meta.url, {
	init,
}, {
	exclude: [
		pageDetect.isGist, // "Your repositories" does not exist
	],
	init: onetime(profileDropdown),
});
