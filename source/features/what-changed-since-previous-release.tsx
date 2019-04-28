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

	// To extract the commit hash from links ike "/facebook/react/commits/92a1d8feac32d03ab5ea6ac13ae4941f6ae93b54"
	const commitRegExp = new RegExp(`\/${ownerName}\/${repoName}\/commit\/([0-9a-f]{5,40})`);

	const tagSelector = getTagSelector(ownerName, repoName);
	const commitIdSelector = getCommitIdSelector(ownerName, repoName);

	const allTagsAnchor = [...select.all<HTMLAnchorElement>(tagSelector)];
	const allTags = extractTagNames(allTagsAnchor, tagRegExp);
	const allCommitIds = extractCommitIds([...select.all<HTMLAnchorElement>(commitIdSelector)], commitRegExp);

	for (let i = 0; i < allTags.length - 1; i++) {
		const previousCommitIndex = getPreviousTagCommitIndex(i, allCommitIds);

		if (previousCommitIndex !== -1) {
			appendCompareIcon(allTagsAnchor[i], allTags[previousCommitIndex], allTags[i]);
		}
	}

	const nextPageLink = select<HTMLAnchorElement>('.pagination a:last-child');

	if (!nextPageLink) {
		return;
	}

	const firstTagAnchorOfNextPage = await fetchDom(nextPageLink.href, tagSelector) as HTMLAnchorElement;

	appendCompareIcon(
		allTagsAnchor[allTagsAnchor.length - 1],
		extractTagName(firstTagAnchorOfNextPage.pathname, tagRegExp),
		allTags[allTags.length - 1]
	);
}

const getPreviousTagCommitIndex = (currentIndex: number, allCommitIds: string[]) => {
	for (let i = currentIndex + 1; i < allCommitIds.length - 1; i++) {
		if (allCommitIds[i] !== allCommitIds[currentIndex]) {
			return i;
		}
	}

	return -1;
};

const extractCommitIds = (allCommitIdsAnchor: HTMLAnchorElement[], commitRegExp: RegExp): string[] => {
	return allCommitIdsAnchor.map((commitIdAnchor: HTMLAnchorElement): string => {
		const [, commitId] = commitIdAnchor.pathname.match(commitRegExp)!;

		return commitId;
	});
}

const extractTagNames = (allTagsAnchor: HTMLAnchorElement[], tagRegExp: RegExp): string[] => {
	return allTagsAnchor.map((tagAnchor: HTMLAnchorElement): string => {
		const [, tagName] = tagAnchor.pathname.match(tagRegExp)!;

		return tagName;
	});
}

const getCommitIdSelector = (ownerName: string, repoName: string): string => {
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
const getTagSelector = (ownerName: string, repoName: string): string => {
	const tagAnchorSelector = `a[href^="/${ownerName}/${repoName}/releases/tag"]`;

	if (isReleasesListPage()) {
		return `.release-main-section h4.commit-title ${tagAnchorSelector}, .release-main-section .release-header ${tagAnchorSelector}`;
	}

	if (isTagsListPage()) {
		return `h4.commit-title > ${tagAnchorSelector}`;
	}

	return tagAnchorSelector;
}

const isReleasesListPage = () => {
	return /^(releases)/.test(getRepoPath()!);
}

const isTagsListPage = () => {
	return /^(tags)/.test(getRepoPath()!);
}

const appendCompareIcon = (anchor: HTMLAnchorElement, prevTag: string, nextTag: string): void => {
	const {ownerName, repoName} = getOwnerAndRepo();

	anchor.after(
		<span className="ellipsis-expander rgh-what-changed">
			<a href={`/${ownerName}/${repoName}/compare/${prevTag}...${nextTag}`}>
				<span>…</span>
			</a>
		</span>
	)
}

const extractTagName = (tagPathname: string, regex: RegExp): string => {
	const [, tag] = tagPathname.match(regex)!;

	return tag;
};

features.add({
	id: 'what-changed-since-previous-release',
	include: [
		features.isReleasesOrTags
	],
	load: features.onAjaxedPages,
	init
});
