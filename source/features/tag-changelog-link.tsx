/**
This feature adds a compare link on each releases/tags/single tag page so that you can see
what has changed since the previous release. If the tags are namespaced then it tries to
get the previous release of the same namespaced tag.

See it in action at: https://github.com/parcel-bundler/parcel/releases
*/

import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import fetchDom from '../libs/fetch-dom';
import {getOwnerAndRepo} from '../libs/utils';
import {isSingleTagPage} from '../libs/page-detect';
import {diff} from '../libs/icons';

async function init(): Promise<void | false> {
	if (select.exists('.blankslate')) {
		return false;
	}

	const tagSelector = 'h4.commit-title a[href*="/releases/tag"], .commit .release-header a[href*="/releases/tag"]';
	const commitIdSelector = '.commit > ul a[href*="/commit/"], .release > div:first-child > ul a[href*="/commit/"]';

	const allTags = extractTextFromAnchors(select.all<HTMLAnchorElement>(tagSelector));
	const allCommitIdsAnchor = select.all<HTMLAnchorElement>(commitIdSelector);
	const allCommitIds = extractTextFromAnchors(allCommitIdsAnchor);

	const nextPageLink = select<HTMLAnchorElement>('.pagination a:last-child');
	const nextPage = nextPageLink ? await fetchDom(nextPageLink.href) : await getNextPageForSinglePageTag(allTags[0]);

	if (nextPage) {
		allTags.push(...extractTextFromAnchors(select.all<HTMLAnchorElement>(tagSelector, nextPage)));
		allCommitIds.push(...extractTextFromAnchors(select.all<HTMLAnchorElement>(commitIdSelector, nextPage)));
	}

	const {ownerName, repoName} = getOwnerAndRepo();

	for (let index = 0; index < allCommitIdsAnchor.length; index++) {
		const prevTagIndex = getPreviousTagIndex(index, allCommitIds, allTags);

		if (prevTagIndex !== -1) {
			allCommitIdsAnchor[index].closest('ul')!.append(
				<li className="d-inline-block mb-1 mt-1 f6">
					<a
						className="muted-link text-mono tooltipped tooltipped-n"
						aria-label={'See changes since ' + allTags[prevTagIndex]}
						href={`/${ownerName}/${repoName}/compare/${allTags[prevTagIndex]}...${allTags[index]}`}
					>
						{diff()} Changelog
					</a>
				</li>
			);
		}
	}
}

const extractTextFromAnchors = (anchors: HTMLAnchorElement[]): string[] =>
	anchors.map((anchor: HTMLAnchorElement): string => anchor.textContent!.trim());

const getNextPageForSinglePageTag = async (tag: string): Promise<void | DocumentFragment> => {
	if (!isSingleTagPage()) {
		return;
	}

	const {ownerName, repoName} = getOwnerAndRepo();

	// Firefox requires location.origin for fetch without that relative URLs will fail on Firefox.
	// See: https://github.com/sindresorhus/refined-github/pull/1998#issuecomment-488231253
	return fetchDom(`${location.origin}/${ownerName}/${repoName}/releases?after=${tag}`);
};

const getPreviousTagIndex = (index: number, allCommitIds: string[], allTags: string[]): number => {
	let prevTagIndex = -1;

	for (let i = index + 1; i < allCommitIds.length; i++) {
		if (allCommitIds[i] === allCommitIds[index]) {
			continue;
		}

		if (doesNamespaceMatch(allTags[i], allTags[index])) {
			return i;
		}

		if (prevTagIndex === -1) {
			prevTagIndex = i;
		}
	}

	return prevTagIndex;
};

const doesNamespaceMatch = (tag1: string, tag2: string): boolean =>
	tag1.split(/@[^@]+$/)[0] === tag2.split(/@[^@]+$/)[0];

features.add({
	id: 'tag-changelog-link',
	include: [
		features.isReleasesOrTags
	],
	load: features.onAjaxedPages,
	init
});
