import React from 'dom-chef';
import select from 'select-dom';
import tinyVersionCompare from 'tiny-version-compare';
import features from '../libs/features';
import fetchDom from '../libs/fetch-dom';
import * as icons from '../libs/icons';
import {isSingleTagPage} from '../libs/page-detect';
import {getRepoPath, getRepoURL, parseTag, sliceAsyncIterator} from '../libs/utils';

type TagDetails = {
	element: HTMLElement;
	commit: string;
	tag: string;
	version: string;
	namespace: string;
};

async function getNextPage(): Promise<DocumentFragment> {
	if (isSingleTagPage()) {
		const [, tag = ''] = getRepoPath()!.split('releases/tag/', 2); // Already URL-encoded
		return fetchDom(`/${getRepoURL()}/tags?after=${tag}`);
	}

	const nextPageLink = select<HTMLAnchorElement>('.pagination a:last-child');
	if (nextPageLink) {
		return fetchDom(nextPageLink.href);
	}

	return new DocumentFragment();
}

function parseTags(element: HTMLElement): TagDetails {
	const {pathname: tagUrl} = select<HTMLAnchorElement>('[href*="/releases/tag/"]', element)!;
	const tag = /\/releases\/tag\/(.*)/.exec(tagUrl)![1];

	return {
		element,
		tag,
		commit: select('[href*="/commit/"]', element)!.textContent!.trim(),
		...parseTag(decodeURIComponent(tag)) // `version`, `namespace`
	};
}

// Const memoizedSelectAll = mem(select.all, {cacheKey: ([, x]: Parameters<typeof select.all>) => x});
// This joins multiple `select.all` without having to wait for every `baseElement` Promise to be resolved.
async function * incrementalParseTags(selectors: string, baseElements: Iterable<ParentNode | Promise<ParentNode>>): AsyncGenerator<TagDetails> {
	for (const baseElement of baseElements) {
		// eslint-disable-next-line no-await-in-loop
		for (const element of select.all(selectors, await baseElement)) {
			yield parseTags(element);
		}
	}
}

async function addPreviousTag(currentTag: TagDetails, olderTags: AsyncIterable<TagDetails>): Promise<void> {
	let previousTag: TagDetails | undefined;
	for await (const olderTag of olderTags) {
		// Find a version on a different commit, if there are multiple tags on the same one
		if (olderTag.commit === currentTag.commit) {
			continue;
		}

		// Find an earlier version
		if (tinyVersionCompare(currentTag.version, olderTag.version) < 1) {
			continue;
		}

		if (currentTag.namespace === olderTag.namespace) {
			addLink(currentTag, olderTag);
			return;
		}

		// If no matching namespace is found, just use the next one
		if (!previousTag) {
			previousTag = olderTag;
		}
	}

	addLink(currentTag, previousTag!);
}

function addLink(currentTag: TagDetails, previousTag: TagDetails): void {
	// Signed releases include on mobile include a "Verified" <details> inside the `ul`. `li:last-of-type` excludes it.
	// Example: https://github.com/tensorflow/tensorflow/releases?after=v1.12.0-rc1
	for (const lastLink of select.all('.list-style-none > li:last-of-type', currentTag.element)) {
		lastLink.after(
			<li className={lastLink.className}>
				<a
					className="muted-link tooltipped tooltipped-n"
					aria-label={'See changes since ' + decodeURIComponent(previousTag.tag)}
					href={`/${getRepoURL()}/compare/${previousTag.tag}...${currentTag.tag}`}
				>
					{icons.diff()} Changelog
				</a>
			</li>
		);

		// `lastLink` is no longer the last link, so it shouldn't push our new link away.
		// Example: https://github.com/tensorflow/tensorflow/releases?after=v1.12.0-rc1
		lastLink.classList.remove('flex-auto');
	}
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

	let index = 0;
	for await (const currentTagElement of select.all(tagsSelectors)) {
		// Look for tags in the current page and the next page
		const allTags = incrementalParseTags(tagsSelectors, [document, getNextPage()]);
		addPreviousTag(parseTags(currentTagElement), sliceAsyncIterator(allTags, ++index));
	}
}

features.add({
	id: __featureName__,
	description: 'Adds a link to an automatic changelog for each tag/release.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/57081611-ad4a7180-6d27-11e9-9cb6-c54ec1ac18bb.png',
	include: [
		features.isReleasesOrTags
	],
	load: features.onAjaxedPages,
	init
});
