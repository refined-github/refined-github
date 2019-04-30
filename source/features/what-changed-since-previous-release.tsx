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

	// To extract the tag "v16.8.6" from links like "/facebook/react/releases/tag/v16.8.6"
	const tagRegExp = /releases\/tag\/(.*)$/;

	// To extract the commit hash from links like "/facebook/react/commit/92a1d8feac32d03ab5ea6ac13ae4941f6ae93b54"
	const commitRegExp = /commit\/([0-9a-f]{40})$/;

	const tagSelector = 'h4.commit-title a[href*="/releases/tag"], .commit .release-header a[href*="/releases/tag"]';
	const commitIdSelector = '.commit > ul a[href*="/commit/"], .release > div:first-child > ul a[href*="/commit/"]';

	const allTags = extractValuesFromPathname(select.all<HTMLAnchorElement>(tagSelector), tagRegExp);
	const allCommitIdsAnchor = select.all<HTMLAnchorElement>(commitIdSelector);
	const allCommitIds = extractValuesFromPathname(allCommitIdsAnchor, commitRegExp);

	const nextPageLink = select<HTMLAnchorElement>('.pagination a:last-child');
	const nextPage = nextPageLink ? await fetchDom(nextPageLink.href) : await getNextPageForSinglePageTag(allTags[0]);

	if (nextPage) {
		allTags.push(...extractValuesFromPathname(select.all<HTMLAnchorElement>(tagSelector, nextPage), tagRegExp));
		allCommitIds.push(...extractValuesFromPathname(select.all<HTMLAnchorElement>(commitIdSelector, nextPage), commitRegExp));
	}

	for (let index = 0; index < allCommitIdsAnchor.length; index++) {
		const previousTagIndex = getPreviousTagIndex(index + 1, allCommitIds[index], allCommitIds, allTags[index], allTags);

		if (previousTagIndex !== -1) {
			allCommitIdsAnchor[index].parentElement!.parentElement!.append(getTagComparisonLink(allTags[previousTagIndex], allTags[index]));
		}
	}
}

const extractValuesFromPathname = (anchors: HTMLAnchorElement[], regexp: RegExp): string[] => {
	return anchors.map((anchor: HTMLAnchorElement): string => {
		const [, value] = anchor.pathname.match(regexp)!;

		return decodeURIComponent(value);
	});
};

const getNextPageForSinglePageTag = async (tag: string): Promise<void | DocumentFragment> => {
	if (!isSingleTagPage()) {
		return;
	}

	const {ownerName, repoName} = getOwnerAndRepo();

	return fetchDom(`/${ownerName}/${repoName}/releases?after=${tag}`);
}

const getPreviousTagIndex = (startIndex: number, commitId: string, allCommitIds: string[], tag: string, allTags: string[]): number => {
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

const getTagComparisonLink = (prevTag: string, nextTag: string): HTMLElement => {
	const {ownerName, repoName} = getOwnerAndRepo();

	return (
		<li className="rgh-what-changed">
			<a className="muted-link text-mono" href={`/${ownerName}/${repoName}/compare/${prevTag}...${nextTag}`}>
				<div className="d-inline-block mr-1">{diff()}</div>compare
			</a>
		</li>
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
