import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import features from '.';
import observe from '../helpers/selector-observer';


function addSourceTypeToLink(link: HTMLAnchorElement): void {
	const search = new URLSearchParams(link.search);
	search.set('type', 'source');
	link.search = String(search);
}


async function profileDropdown(signal: AbortSignal): Promise<void> {
	observe(`.header-nav-current-user ~ a[href$="tab=repositories"]`, addSourceTypeToLink, {signal});
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
	exclude: [
		pageDetect.isPrivateUserProfile,
	],
}, {
	init: profileDropdown,
	exclude: [
		pageDetect.isGist, // "Your repositories" does not exist
	],
});
