import features from '../feature-manager.js';
import onetime from '../helpers/onetime.js';
import observe from '../helpers/selector-observer.js';

function addSourceTypeToLink(link: HTMLAnchorElement): void {
	const search = new URLSearchParams(link.search);
	search.set('type', 'source');
	link.search = String(search);
}

const skipUrlsWithType = ':not([href*="&type="], .issues-reset-query)';

const selectors = [
	// User repos
	`a[href*="?tab=repositories"]:is([href^="/"], [href^="${location.origin}/"])${skipUrlsWithType}`,

	// Organization repos
	`a[href*="/repositories"]:is([href^="/orgs/"], [href^="${location.origin}/orgs/"])${skipUrlsWithType}`,
] as const;

function initOnce(): void {
	observe(selectors, addSourceTypeToLink);
}

void features.add(import.meta.url, {
	// No `include` necessary
	init: onetime(initOnce),
});

/*

## Test URLs

- https://github.com/fregante?tab=repositories
- https://github.com/orgs/refined-github/repositories
- The "Your repositories" link in the user dropdown in the header
- The "Repositories" tab in
	- https://github.com/fregante
	- https://github.com/refined-github

*/
