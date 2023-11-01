import './tag-changes-link.css';
import React from 'dom-chef';
import {$, $$, elementExists} from 'select-dom';
import domLoaded from 'dom-loaded';
import {DiffIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';
import tinyVersionCompare from 'tiny-version-compare';

import features from '../feature-manager.js';
import fetchDom from '../helpers/fetch-dom.js';
import {buildRepoURL, getRepo, parseTag} from '../github-helpers/index.js';

type TagDetails = {
	element: HTMLElement;
	commit: string;
	tag: string;
	version: string;
	namespace: string;
};

async function getNextPage(): Promise<DocumentFragment> {
	const nextPageLink = $('.pagination a:last-child');
	if (nextPageLink) {
		return fetchDom(nextPageLink.href);
	}

	if (pageDetect.isSingleReleaseOrTag()) {
		const [, tag = ''] = getRepo()!.path.split('releases/tag/', 2); // Already URL-encoded
		return fetchDom(buildRepoURL(`tags?after=${tag}`));
	}

	return new DocumentFragment();
}

function parseTags(element: HTMLElement): TagDetails {
	// Safari doesn't correctly parse links if they're loaded via AJAX #3899
	const {pathname: tagUrl} = new URL($(['a[href*="/tree/"]', 'a[href*="/tag/"]'], element)!.href);
	const tag = /\/(?:releases\/tag|tree)\/(.*)/.exec(tagUrl)![1];

	return {
		element,
		tag,
		commit: $('[href*="/commit/"]', element)!.textContent.trim(),
		...parseTag(decodeURIComponent(tag)), // `version`, `namespace`
	};
}

function getPreviousTag(current: number, allTags: TagDetails[]): string | undefined {
	let unmatchedNamespaceTag: string | undefined;

	for (let next = current + 1; next < allTags.length; next++) {
		// Find a version on a different commit, if there are multiple tags on the same one
		if (allTags[next].commit === allTags[current].commit) {
			continue;
		}

		// Find an earlier version
		if (tinyVersionCompare(allTags[current].version, allTags[next].version) < 1) {
			continue;
		}

		if (allTags[current].namespace === allTags[next].namespace) {
			return allTags[next].tag;
		}

		// If no matching namespace is found, just use the next one
		if (!unmatchedNamespaceTag) {
			unmatchedNamespaceTag = allTags[next].tag;
		}
	}

	return unmatchedNamespaceTag;
}

async function init(): Promise<void> {
	document.documentElement.classList.add('rgh-tag-changes-link');

	const tagsSelector = [
		// https://github.com/facebook/react/releases (release in releases list)
		'.repository-content .col-md-2',

		// https://github.com/facebook/react/tags (tags list)
		'.Box-row .commit',

		// https://github.com/facebook/react/releases/tag/v17.0.2 (single release page)
		'.Box-body .border-md-bottom',
	];

	// Look for tags in the current page and the next page
	const pages = [document, await getNextPage()];
	await domLoaded;
	const allTags = $$(tagsSelector, pages).map(tag => parseTags(tag));

	for (const [index, container] of allTags.entries()) {
		const previousTag = getPreviousTag(index, allTags);
		if (!previousTag) {
			continue;
		}

		const lastLinks = $$([
			'.Link--muted[data-hovercard-type="commit"]', // Link to commit in release sidebar
			'.list-style-none > .d-inline-block:last-child', // Link to source tarball under release tag
		], container.element);
		for (const lastLink of lastLinks) {
			const currentTag = allTags[index].tag;
			const compareLink = (
				<a
					className="Link--muted tooltipped tooltipped-n"
					aria-label={`See commits between ${decodeURIComponent(previousTag)} and ${decodeURIComponent(currentTag)}`}
					href={buildRepoURL(`compare/${previousTag}...${currentTag}`)}
				>
					<DiffIcon/> {pageDetect.isEnterprise() ? 'Commits' : <span className="ml-1 wb-break-all">Commits</span>}
				</a>
			);

			// The page of a tag without a release still uses the old layout #5037
			if (pageDetect.isEnterprise() || pageDetect.isTags() || (pageDetect.isSingleReleaseOrTag() && elementExists('.release'))) {
				lastLink.after(
					<li className={lastLink.className + ' rgh-changelog-link'}>
						{compareLink}
					</li>,
				);
				// Fix spacing issue when the window is < 700px wide https://github.com/refined-github/refined-github/pull/3841#issuecomment-754325056
				lastLink.classList.remove('flex-auto');
				continue;
			}

			lastLink.parentElement!.after(
				<div className={'rgh-changelog-link ' + (pageDetect.isReleases() ? 'mb-md-2 mr-3 mr-md-0' : 'mr-4 mb-2')}>
					{compareLink}
				</div>,
			);
			if (pageDetect.isReleases()) {
				lastLink.classList.remove('mb-2');
				lastLink.parentElement!.classList.remove('mb-md-2');
			}
		}
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isReleasesOrTags,
		pageDetect.isSingleReleaseOrTag,
	],
	exclude: [
		pageDetect.isEmptyRepoRoot,
	],
	deduplicate: 'has-rgh-inner',
	init,
});

/*

Test URLs:

- https://github.com/refined-github/refined-github/releases
- https://github.com/refined-github/refined-github/tags
- https://github.com/refined-github/refined-github/releases/tag/23.2.5

*/
