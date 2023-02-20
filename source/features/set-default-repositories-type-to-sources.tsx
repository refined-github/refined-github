import features from '../feature-manager';
import observe from '../helpers/selector-observer';

function addSourceTypeToLink(link: HTMLAnchorElement): void {
	const search = new URLSearchParams(link.search);
	search.set('type', 'source');
	link.search = String(search);
}

// No `include`, no `signal` necessary
function init(): void {
	observe([
		'.header-nav-current-user ~ a[href$="tab=repositories"]', // "Your repositories" in the header profile dropdown
		'[aria-label="User profile"] a[href$="tab=repositories"]', // "Repositories" tab on user profile
		'[aria-label="Organization"] [data-tab-item="org-header-repositories-tab"] a', // "Repositories" tab on organization profile
		'a[data-hovercard-type="organization"]', // Organization name on repo header + organization list on user profile
	], addSourceTypeToLink);
}

void features.add(import.meta.url, {
	init,
});
