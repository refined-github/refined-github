import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import fetchDom from '../libs/fetch-dom';
import {getOwnerAndRepo} from '../libs/utils';
import {isTagsListPage, isReleasesListPage} from '../libs/page-detect';

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
	const allTags = extractAnchorValues(allTagsAnchor, tagRegExp);

	const allCommitIds = extractAnchorValues([...select.all<HTMLAnchorElement>(getCommitIdSelector())], commitRegExp);

	for (let index = 0; index < allTags.length - 1; index++) {
		const previousCommitIndex = getPreviousTagIndex(index + 1, allCommitIds[index], allCommitIds, allTags[index], allTags);

		if (previousCommitIndex !== -1) {
			allTagsAnchor[index].after(getCompareIcon(allTags[previousCommitIndex], allTags[index]));
		}
	}

	const nextPageLink = select<HTMLAnchorElement>('.pagination a:last-child');

	if (!nextPageLink) {
		return;
	}

	const nextPage = await fetchDom(nextPageLink.href);

	const nextPageAllTagsAnchor = [...select.all<HTMLAnchorElement>(getTagSelector(), nextPage)];
	const nextPageAllTags = extractAnchorValues(nextPageAllTagsAnchor, tagRegExp);

	const nextPageAllCommitIds = extractAnchorValues([...select.all<HTMLAnchorElement>(getCommitIdSelector(), nextPage)], commitRegExp);

	for (let index = 0; index < nextPageAllTags.length; index++) {
		const previousCommitIndex = getPreviousTagIndex(index, allCommitIds[allCommitIds.length - 1], nextPageAllCommitIds, allTags[allTags.length - 1], nextPageAllTags);

		if (previousCommitIndex !== -1) {
			allTagsAnchor[allTagsAnchor.length - 1].after(getCompareIcon(nextPageAllTags[previousCommitIndex], allTags[allTags.length - 1]));
			break;
		}
	}
}

const extractAnchorValues = (anchors: HTMLAnchorElement[], regexp: RegExp): string[] => {
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

		if (isSameNameSpaceTag(allTags[i], tag)) {
			return i;
		}

		if (index === -1) {
			index = i;
		}
	}

	return index;
};

const isSameNameSpaceTag = (tag1: string, tag2: string): boolean => {
	if (!tag1.includes('@') || !tag2.includes('@')) {
		return false;
	}

	const namespaceRegex = /(.*)@[0-9.]*/;

	const [, tagOneNameSpace = ''] = tag1.match(namespaceRegex)! || [];
	const [, tagTwoNameSpace = ''] = tag2.match(namespaceRegex)! || [];

	return tagOneNameSpace === tagTwoNameSpace;
};

// To select all links like "/facebook/react/commit/"
const getCommitIdSelector = (): string => {
	const {ownerName, repoName} = getOwnerAndRepo();

	const commitAnchorSelector = `a[href^="/${ownerName}/${repoName}/commit/"]`;

	if (isReleasesListPage()) {
		return `.release-entry .release-main-section .commit > ul ${commitAnchorSelector}, .release-entry > .release > div:first-child > ul ${commitAnchorSelector}`;
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

const getCompareIcon = (prevTag: string, nextTag: string): HTMLElement => {
	const {ownerName, repoName} = getOwnerAndRepo();

	return (
		<a href={`/${ownerName}/${repoName}/compare/${prevTag}...${nextTag}`} className="rgh-what-changed">
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
