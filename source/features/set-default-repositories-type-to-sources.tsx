import select from 'select-dom';

import features from '.';
import oneEvent from '../helpers/one-event';

function addSourceTypeToLink(link: HTMLAnchorElement): void {
	const search = new URLSearchParams(link.search);
	search.set('type', 'source');
	link.search = String(search);
}

// If the dropdown exists, await it; If not, it probably already loaded
async function onProfileDropdownLoad(): Promise<void> {
	const dropdown = select('.Header details-menu[src^="/users/"] include-fragment');
	if (dropdown) {
		await oneEvent(dropdown, 'load');
	}
}

async function init(): Promise<void> {
	const links = select.all<HTMLAnchorElement>([
		// Pre "Repository refresh" layout
		'#user-links [href$="tab=repositories"]', // "Repositories" tab on user profile
		'.orgnav > .pagehead-tabs-item:first-child', // "Repositories" tab on organization profile
		// "Repository refresh" layout
		'[aria-label="User profile"] [href$="tab=repositories"]', // "Repositories" tab on user profile
		'[aria-label="Organization"] .UnderlineNav-item:first-child', // "Repositories" tab on organization profile
		'[data-hovercard-type="organization"]' // Organization name on repo header + organization list on user profile
	]);

	for (const link of links) {
		addSourceTypeToLink(link);
	}

	// "Your repositories" in header dropdown
	await onProfileDropdownLoad();
	addSourceTypeToLink(select<HTMLAnchorElement>('.header-nav-current-user ~ [href$="tab=repositories"]')!);
}

void features.add(__filebasename, {
	init
});
