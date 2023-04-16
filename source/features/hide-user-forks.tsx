import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import observe from '../helpers/selector-observer';

const isProfileRepoList = (url: URL | HTMLAnchorElement | Location = location): boolean =>
	pageDetect.isUserProfileRepoTab(url) || pageDetect.utils.getOrg(url)?.path === 'repositories';

function addSourceTypeToLink(link: HTMLAnchorElement): void {
	if (!isProfileRepoList(link)) {
		return;
	}

	const search = new URLSearchParams(link.search);
	search.set('type', 'source');
	link.search = String(search);
}

const selectors = [
	// User repos
	`a[href$="?tab=repositories"]:is([href^="/"], [href^="${location.origin}/"])`,

	// Organization repos
	`a[href$="/repositories"]:is([href^="/orgs/"], [href^="${location.origin}/orgs/"])`,
] as const;

// No `include`, no `signal` necessary
function init(): void {
	observe(selectors, addSourceTypeToLink);
}

void features.add(import.meta.url, {
	init,
});

/*

## Test

- https://github.com/fregante?tab=repositories
- https://github.com/orgs/refined-github/repositories
- The "Your repositories" link in the user dropdown in the header
- The "Repositories" tab in
	- https://github.com/fregante
	- https://github.com/refined-github

*/
