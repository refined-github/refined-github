import select from 'select-dom';

import features from '.';
import onFragmentLoad from '../github-events/on-fragment-load';

function addSourceTypeToLink(link: HTMLAnchorElement): void {
	const search = new URLSearchParams(link.search);
	search.set('type', 'source');
	link.search = String(search);
}

function headerDropdownListener(): void {
	addSourceTypeToLink(select<HTMLAnchorElement>('.header-nav-current-user ~ [href$="tab=repositories"]')!);
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

	onFragmentLoad('.Header-item > details include-fragment', headerDropdownListener); // "Your repositories" in header dropdown
}

void features.add(__filebasename, {
	init
});
