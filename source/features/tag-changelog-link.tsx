/*
This feature adds a compare link on each releases/tags/single tag page so that you can see
what has changed since the previous release. If the tags are namespaced then it tries to
get the previous release of the same namespaced tag.

See it in action at: https://github.com/parcel-bundler/parcel/releases
*/

import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import fetchDom from '../libs/fetch-dom';
import {diff} from '../libs/icons';
import {isSingleTagPage} from '../libs/page-detect';
import {getRepoPath, getRepoURL} from '../libs/utils';

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

async function init(): Promise<void | false> {
	if (select.exists('.blankslate')) {
		return false;
	}

	const documents = [document, await getNextPage()] as any; // TODO: fix select-dom types to accept mixed arrays
	// These selectors need to work on:
	// https://github.com/facebook/react/tags (tags list)
	// https://github.com/facebook/react/releases (releases list)
	// https://github.com/parcel-bundler/parcel/releases (releases list without release notes)
	const tagElements = select.all('.f1 [href*="/releases/tag"], .commit-title [href*="/releases/tag"]', documents);
	const commitElements = select.all('.muted-link[href*="/commit/"]', documents);
	const tags = tagElements.map(anchor => anchor.textContent!.trim());
	const commits = commitElements.map(anchor => anchor.textContent!.trim());

	for (const [index, commitElement] of commitElements.entries()) {
		const previousTag = getPreviousTag(index, commits, tags);

		if (previousTag !== false) {
			const container = commitElement.closest('ul')!;
			container.append(
				<li className={container.lastElementChild!.className}>
					<a
						className="muted-link tooltipped tooltipped-n"
						aria-label={'See changes since ' + previousTag}
						href={`/${getRepoURL()}/compare/${previousTag}...${tags[index]}`}
					>
						{diff()} Changelog
					</a>
				</li>
			);
		}
	}
}

const getPreviousTag = (index: number, commits: string[], tags: string[]): string | false => {
	let previousTag: string | false = false;
	for (let i = index + 1; i < commits.length; i++) {
		if (commits[i] === commits[index]) {
			continue;
		}

		// Ensure that they have the same namespace. e.g. `parcel@1.2.4` and `parcel@1.2.3`
		if (tags[i].split(/@[^@]+$/)[0] === tags[index].split(/@[^@]+$/)[0]) {
			return tags[i];
		}

		if (previousTag === false) {
			previousTag = tags[i];
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
