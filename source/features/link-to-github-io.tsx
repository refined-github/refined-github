import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import LinkIcon from 'octicons-plain-react/Link';

import features from '../feature-manager.js';
import {getRepo} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';

// Repos named after the domain they're published at. Only suffixes with plenty of repos are included
const siteSuffixes = [
	'.github.io',
	// Earlier GitHub Pages were hosted on github.com #6228
	'.github.com',
	'.js.org',
	'.vercel.app',
	'.netlify.app',
];

const siteSuffixesRegex = new RegExp(
	`(?:${siteSuffixes.map(suffix => suffix.replaceAll('.', String.raw`\.`)).join('|')})$`,
);

function getLinkToSite(repoTitle: HTMLElement, className?: string): JSX.Element {
	return (
		<a
			href={`https://${repoTitle.textContent.trim().replace(/\.github\.com$/, '.github.io')}`}
			className={className}
		>
			<LinkIcon className="v-align-middle" />
		</a>
	);
}

function addRepoListLink(repoTitle: HTMLAnchorElement): void {
	repoTitle.after(' ', getLinkToSite(repoTitle));
}

function addOrgRepoListLink(repoTitle: HTMLAnchorElement): void {
	repoTitle.after(getLinkToSite(repoTitle, 'ml-1'));
}

function addRepoHeaderLink(repoTitle: HTMLElement): void {
	repoTitle.after(getLinkToSite(repoTitle, 'mr-2'));
}

function initRepo(signal: AbortSignal): void {
	observe('[itemprop="name"]', addRepoHeaderLink, {signal});
}

function initRepoList(signal: AbortSignal): void {
	observe(
		siteSuffixes.map(suffix => `a[itemprop="name codeRepository"][href$="${suffix}"]`),
		addRepoListLink,
		{signal},
	);
	observe(
		siteSuffixes.map(suffix => `li[class*="listItem"] [class*="heading"] > a[class*="anchor"][href$="${suffix}"]`),
		addOrgRepoListLink,
		{signal},
	);
}

void features.add(import.meta.url, {
	asLongAs: [
		pageDetect.isRepoHome,
		() => siteSuffixesRegex.test(getRepo()!.name ?? 'shush eslint'),
	],
	exclude: [
		pageDetect.isEnterprise,
	],
	init: initRepo,
}, {
	include: [
		pageDetect.isProfileRepoList,
		pageDetect.isOrganizationProfile,
	],
	exclude: [
		pageDetect.isEnterprise,
	],
	init: initRepoList,
});

/*

Test URLs:

- Repo: https://github.com/yashshah1/yashshah1.github.io
- List, user: https://github.com/yashshah1?tab=repositories&q=GitHub.io&type=source
- List, org: https://github.com/Qv2ray?q=GitHub.io
- List, org repos: https://github.com/orgs/Qv2ray/repositories?q=GitHub.io
- `.js.org`: https://github.com/webpack/webpack.js.org
- `.vercel.app`: https://github.com/thevrus/vrus.vercel.app
- `.netlify.app`: https://github.com/DragunWF/dragonwf.netlify.app

*/
