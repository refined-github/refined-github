import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import fetchDom from '../libs/fetch-dom';
import {getOwnerAndRepo} from '../libs/utils';
import {isTagsListPage, isReleasesListPage, isSingleTagPage} from '../libs/page-detect';

async function init(): Promise<void | false> {
	if (select.exists('.blankslate')) {
		return false;
	}

	const {ownerName, repoName} = getOwnerAndRepo();

	// To extract the tag "v16.8.6" from links like "/facebook/react/releases/tag/v16.8.6"
	const tagRegExp = new RegExp(`/${ownerName}/${repoName}/releases/tag/(.*)`);

	// To extract the commit hash from links like "/facebook/react/commit/92a1d8feac32d03ab5ea6ac13ae4941f6ae93b54"
	const commitRegExp = new RegExp(`/${ownerName}/${repoName}/commit/([0-9a-f]{5,40})`);

	const allTagsAnchor = [...select.all<HTMLAnchorElement>(getTagSelector())];
	const allTags = extractValuesFromPathname(allTagsAnchor, tagRegExp);
	const allCommitIds = extractValuesFromPathname([...select.all<HTMLAnchorElement>(getCommitIdSelector())], commitRegExp);

	for (let index = 0; index < allTags.length - 1; index++) {
		const previousCommitIndex = getPreviousTagIndex(index + 1, allCommitIds[index], allCommitIds, allTags[index], allTags);

		if (previousCommitIndex !== -1) {
			allTagsAnchor[index].after(getTagComparisonLink(allTags[previousCommitIndex], allTags[index]));
		}
	}

	let nextPage;

	if (isSingleTagPage()) {
		nextPage = await fetchDom(`/${ownerName}/${repoName}/releases?after=${allTags[0]}`);
	} else {
		const nextPageLink = select<HTMLAnchorElement>('.pagination a:last-child');

		if (!nextPageLink) {
			return;
		}

		nextPage = await fetchDom(nextPageLink.href);
	}

	const nextPageAllTagsAnchor = [...select.all<HTMLAnchorElement>(getTagSelector(), nextPage)];
	const nextPageAllTags = extractValuesFromPathname(nextPageAllTagsAnchor, tagRegExp);

	const nextPageAllCommitIds = extractValuesFromPathname([...select.all<HTMLAnchorElement>(getCommitIdSelector(), nextPage)], commitRegExp);

	for (let index = 0; index < nextPageAllTags.length; index++) {
		const previousTagIndex = getPreviousTagIndex(index, allCommitIds[allCommitIds.length - 1], nextPageAllCommitIds, allTags[allTags.length - 1], nextPageAllTags);

		if (previousTagIndex !== -1) {
			allTagsAnchor[allTagsAnchor.length - 1].after(getTagComparisonLink(nextPageAllTags[previousTagIndex], allTags[allTags.length - 1]));
			break;
		}
	}
}

const extractValuesFromPathname = (anchors: HTMLAnchorElement[], regexp: RegExp): string[] => {
	return anchors.map((anchor: HTMLAnchorElement): string => {
		const [, value] = anchor.pathname.match(regexp)!;

		return decodeURIComponent(value);
	});
};

const getPreviousTagIndex = (
	startIndex: number,
	commitId: string,
	allCommitIds: string[],
	tag: string,
	allTags: string[]
): number => {
	let index = -1;

	for (let i = startIndex; i < allCommitIds.length; i++) {
		if (allCommitIds[i] === commitId) {
			continue;
		}

		if (isOfSameHierarchy(allTags[i], tag) && isSameTagNameSpace(allTags[i], tag)) {
			return i;
		}

		if (index === -1) {
			index = i;
		}
	}

	return index;
};

const isOfSameHierarchy = (tag1: string, tag2: string): boolean => {
	const hierarchyRegex = /.*(\/)/;

	const [tagOneHierarchy = ''] = tag1.match(hierarchyRegex) || [];
	const [tagTwoHierarchy = ''] = tag2.match(hierarchyRegex) || [];

	if ((!tagOneHierarchy && tagTwoHierarchy) || (tagOneHierarchy && !tagTwoHierarchy)) {
		return false;
	}

	if (!tagOneHierarchy && !tagTwoHierarchy) {
		return true;
	}

	return tagOneHierarchy === tagTwoHierarchy;
};

const isSameTagNameSpace = (tag1: string, tag2: string): boolean => {
	const namespaceRegex = /(.*)@(.)*/;

	const [, tagOneNameSpace = ''] = tag1.match(namespaceRegex) || [];
	const [, tagTwoNameSpace = ''] = tag2.match(namespaceRegex) || [];

	return tagOneNameSpace === tagTwoNameSpace;
};

// To select all links like "/facebook/react/commit/"
const getCommitIdSelector = (): string => {
	const {ownerName, repoName} = getOwnerAndRepo();

	const commitAnchorSelector = `a[href^="/${ownerName}/${repoName}/commit/"]`;

	if (isReleasesListPage()) {
		return `.release-entry .release-main-section .commit > ul ${commitAnchorSelector}, .release > div:first-child > ul ${commitAnchorSelector}`;
	}

	if (isTagsListPage()) {
		return `.commit > ul ${commitAnchorSelector}`;
	}

	return commitAnchorSelector;
};

// To select all links like "/facebook/react/releases/tag"
const getTagSelector = (): string => {
	const {ownerName, repoName} = getOwnerAndRepo();

	const tagAnchorSelector = `a[href^="/${ownerName}/${repoName}/releases/tag"]`;

	if (isReleasesListPage()) {
		return `.release-main-section h4.commit-title ${tagAnchorSelector}, .release-main-section .release-header ${tagAnchorSelector}`;
	}

	if (isTagsListPage()) {
		return `h4.commit-title > ${tagAnchorSelector}`;
	}

	return tagAnchorSelector;
};

const getTagComparisonLink = (prevTag: string, nextTag: string): HTMLElement => {
	const {ownerName, repoName} = getOwnerAndRepo();

	return (
		<a className="rgh-what-changed" href={`/${ownerName}/${repoName}/compare/${prevTag}...${nextTag}`}>
			<span className="ellipsis-expander">
				<span>…</span>
			</span>
		</a>
	);
};

features.add({
	id: 'what-changed-since-previous-release',
	include: [
		features.isReleasesOrTags
	],
	load: features.onAjaxedPages,
	init
});
