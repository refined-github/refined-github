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
		`a:is([href^="/"], [href^="${location.origin}"])[href$="?tab=repositories"]`, // "Repositories" tab on user profile, only matches relative or same-origin links
		'[aria-label="Organization"] [data-tab-item="org-header-overview-tab"] a', // "Overview" tab on organization profile
		'[aria-label="Organization"] [data-tab-item="org-header-repositories-tab"] a', // "Repositories" tab on organization profile
		'[aria-label="Organization"] a[data-tab-item="i0overview-tab"]', // "Overview" tab on organization profile (Global navigation update)
		'[aria-label="Organization"] a[data-tab-item="i1repositories-tab"]', // "Repositories" tab on organization profile (Global navigation update)
		'a[data-hovercard-type="organization"]', // Organization name on repo header + organization list on user profile
	], addSourceTypeToLink);
}

void features.add(import.meta.url, {
	init,
});

/*

Test URLs:

- User profile: https://github.com/fregante
- Organization profile: https://github.com/refined-github

*/
