import select from 'select-dom';
import elementReady from 'element-ready';

import features from '.';

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

	(await elementReady('[aria-label="View profile and more"]'))! // "Your repositories" in header dropdown
		.closest('details')!
		.addEventListener('toggle', headerDropdownListener, {once: true});
}

void features.add(__filebasename, {
	init
});
