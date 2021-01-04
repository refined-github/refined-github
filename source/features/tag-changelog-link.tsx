import React from 'dom-chef';
import select from 'select-dom';
import {DiffIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';
import tinyVersionCompare from 'tiny-version-compare';

import features from '.';
import fetchDom from '../helpers/fetch-dom';
import {buildRepoURL, getRepo, parseTag} from '../github-helpers';

interface TagDetails {
	element: HTMLElement;
	commit: string;
	tag: string;
	version: string;
	namespace: string;
}

async function getNextPage(): Promise<DocumentFragment> {
	const nextPageLink = select('.pagination a:last-child');
	if (nextPageLink) {
		return fetchDom(nextPageLink.href);
	}

	if (pageDetect.isSingleTag()) {
		const [, tag = ''] = getRepo()!.path.split('releases/tag/', 2); // Already URL-encoded
		return fetchDom(buildRepoURL(`tags?after=${tag}`));
	}

	return new DocumentFragment();
}

function parseTags(element: HTMLElement): TagDetails {
	const {pathname: tagUrl} = select('a[href*="/releases/tag/"]', element)!;
	const tag = /\/releases\/tag\/(.*)/.exec(tagUrl)![1];

	return {
		element,
		tag,
		commit: select('[href*="/commit/"]', element)!.textContent!.trim(),
		...parseTag(decodeURIComponent(tag)) // `version`, `namespace`
	};
}

const getPreviousTag = (current: number, allTags: TagDetails[]): string | undefined => {
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
};

async function init(): Promise<void> {
	const tagsSelector = [
		// https://github.com/facebook/react/releases (release in releases list)
		'.release:not(.label-draft)',

		// https://github.com/facebook/react/releases?after=v16.7.0 (tags in releases list)
		'.release-main-section .commit',

		// https://github.com/facebook/react/tags (tags list)
		'.Box-row .commit'
	];

	// Look for tags in the current page and the next page
	const pages = [document, await getNextPage()];
	const allTags = select.all(tagsSelector, pages).map(parseTags);

	for (const [index, container] of allTags.entries()) {
		const previousTag = getPreviousTag(index, allTags);

		if (previousTag) {
			// Signed releases include on mobile include a "Verified" <details> inside the `ul`. `li:last-of-type` excludes it.
			// Example: https://github.com/tensorflow/tensorflow/releases?after=v1.12.0-rc1
			for (const lastLink of select.all('.list-style-none > li:last-of-type', container.element)) {
				lastLink.after(
					<li className={lastLink.className}>
						<a
							className="muted-link tooltipped tooltipped-n"
							aria-label={'See changes since ' + decodeURIComponent(previousTag)}
							href={buildRepoURL(`compare/${previousTag}...${allTags[index].tag}`)}
						>
							<DiffIcon/> Changelog
						</a>
					</li>
				);

				// `lastLink` is no longer the last link, so it shouldn't push our new link away.
				// Same page as before: https://github.com/tensorflow/tensorflow/releases?after=v1.12.0-rc1
				lastLink.classList.remove('flex-auto');
			}
		}
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isReleasesOrTags
	],
	exclude: [
		pageDetect.isEmptyRepoRoot
	],
	init
});
