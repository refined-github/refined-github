import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import fetchDom from '../libs/fetch-dom';
import {getOwnerAndRepo, getRepoPath} from '../libs/utils';

async function init(): Promise<void | false> {
	if (select.exists('.blankslate')) {
		return false;
	}

	const {ownerName, repoName} = getOwnerAndRepo();

	// To extract the tag "v16.8.6" from links like "/facebook/react/releases/tag/v16.8.6"
	const tagRegExp = new RegExp(`\/${ownerName}\/${repoName}\/releases\/tag\/(.*)`);

	// To extract the commit hash from links like "/facebook/react/commit/92a1d8feac32d03ab5ea6ac13ae4941f6ae93b54"
	const commitRegExp = new RegExp(`\/${ownerName}\/${repoName}\/commit\/([0-9a-f]{5,40})`);

	const allTagsAnchor = [...select.all<HTMLAnchorElement>(getTagSelector())];
	const allTags = extractAnchorValues(allTagsAnchor, tagRegExp);

	const allCommitIds = extractAnchorValues([...select.all<HTMLAnchorElement>(getCommitIdSelector())], commitRegExp);

	for (let index = 0; index < allTags.length - 1; index++) {
		const previousCommitIndex = getPreviousTagCommitIndex(index + 1, allCommitIds[index], allCommitIds);

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

	const nextPageAllCommitIds = extractAnchorValues([...select.all<HTMLAnchorElement>(getCommitIdSelector())], commitRegExp);

	for (let index = 0; index < nextPageAllTags.length; index++) {
		const previousCommitIndex = getPreviousTagCommitIndex(index, allCommitIds[allCommitIds.length - 1], nextPageAllCommitIds);

		if (previousCommitIndex !== -1) {
			allTagsAnchor[allTagsAnchor.length - 1].after(getCompareIcon(nextPageAllTags[previousCommitIndex], allTags[allTags.length - 1]));
			break;
		}
	}
}

const extractAnchorValues = (anchors: HTMLAnchorElement[], regexp: RegExp): string[] => {
	return anchors.map((anchor: HTMLAnchorElement): string => {
		const [, value] = anchor.pathname.match(regexp)!;

		return value;
	});
}

const getPreviousTagCommitIndex = (startIndex: number, commitId: string, allCommitIds: string[]) => {
	for (let i = startIndex; i < allCommitIds.length; i++) {
		if (allCommitIds[i] !== commitId) {
			return i;
		}
	}

	return -1;
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
}

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
}

const isReleasesListPage = () => /^(releases)/.test(getRepoPath()!);

const isTagsListPage = () => /^(tags)/.test(getRepoPath()!);

const getCompareIcon = (prevTag: string, nextTag: string): HTMLSpanElement => {
	const {ownerName, repoName} = getOwnerAndRepo();

	return (
		<span className="ellipsis-expander rgh-what-changed">
			<a href={`/${ownerName}/${repoName}/compare/${prevTag}...${nextTag}`}>
				<span>…</span>
			</a>
		</span>
	)
}

features.add({
	id: 'what-changed-since-previous-release',
	include: [
		features.isReleasesOrTags
	],
	load: features.onAjaxedPages,
	init
});
