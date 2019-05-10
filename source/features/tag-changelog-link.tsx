/*
Adds a compare link on each releases/tags/single tag page so that you can see what has changed since the previous release.
If the tags are namespaced then it tries to get the previous release of the same namespaced tag.

See it in action at: https://github.com/parcel-bundler/parcel/releases
*/
import './tag-changelog-link.css';
import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import fetchDom from '../libs/fetch-dom';
import {diff} from '../libs/icons';
import {isSingleTagPage} from '../libs/page-detect';
import {getRepoPath, getRepoURL} from '../libs/utils';

type TagDetails = {
	element: HTMLElement;
	commit: string;
	tag: string;
}

async function getNextPage(): Promise<DocumentFragment> {
	const nextPageLink = select<HTMLAnchorElement>('.pagination a:last-child');
	if (nextPageLink) {
		return fetchDom(nextPageLink.href);
	}

	if (isSingleTagPage()) {
		const [, tag = ''] = getRepoPath()!.split('releases/tag/', 2); // Already URL-encoded
		return fetchDom(`/${getRepoURL()}/tags?after=${tag}`);
	}

	return new DocumentFragment();
}

function parseTags(element: HTMLElement): TagDetails {
	return {
		element,
		commit: select('[href*="/commit/"]', element)!.textContent!.trim(),
		tag: select<HTMLAnchorElement>('[href*="/releases/tag/"]', element)!.pathname.match(/\/releases\/tag\/(.*)/)![1]
	};
}

async function init(): Promise<void | false> {
	if (select.exists('.blankslate')) {
		return false;
	}

	const tagsSelectors = [
		// https://github.com/facebook/react/releases (release in releases list)
		'.release',

		// https://github.com/facebook/react/releases?after=v16.7.0 (tags in releases list)
		'.release-main-section .commit',

		// https://github.com/facebook/react/tags (tags list)
		'.Box-row .commit'
	].join();

	// Look for tags in the current page and the next page
	const pages = [document, await getNextPage()];
	const allTags = select.all(tagsSelectors, pages).map(parseTags);

	for (const [index, container] of allTags.entries()) {
		const previousTag = getPreviousTag(index, allTags);

		if (previousTag !== false) {
			const unorderedLists = select.all('.commit > ul.f6, .commit > .release-header > ul, div:first-child > ul', container.element);

			for (const list of unorderedLists) {
				list.append(
					<li className={list.lastElementChild!.className}>
						<a
							className="muted-link tooltipped tooltipped-n"
							aria-label={'See changes since ' + decodeURIComponent(previousTag)}
							href={`/${getRepoURL()}/compare/${previousTag}...${allTags[index].tag}`}
						>
							{diff()} Changelog
						</a>
					</li>
				);
			}
		}
	}
}

// If tag is `@parcel/integration-tests@1.12.2` then namespace is `@parcel/integration-tests`
const getNameSpace = (tag: string): string => tag.split(/@[^@]+$/)[0];

const getPreviousTag = (index: number, allTags: TagDetails[]): string | false => {
	let previousTag: string | false = false;

	for (let i = index + 1; i < allTags.length; i++) {
		if (allTags[i].commit === allTags[index].commit) {
			continue;
		}

		// Ensure that they have the same namespace. e.g. `parcel@1.2.4` and `parcel@1.2.3`
		if (getNameSpace(allTags[i].tag) === getNameSpace(allTags[index].tag)) {
			return allTags[i].tag;
		}

		if (previousTag === false) {
			previousTag = allTags[i].tag;
		}
	}

	return previousTag;
};

features.add({
	id: 'tag-changelog-link',
	include: [
		features.isReleasesOrTags
	],
	load: features.onAjaxedPages,
	init
});
