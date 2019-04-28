import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import fetchDom from '../libs/fetch-dom';
import {getOwnerAndRepo, getRepoPath} from '../libs/utils';
import { diff } from '../libs/icons';

async function init(): Promise<void | false> {
	if (select.exists('.blankslate')) {
		return false;
	}

	const {ownerName, repoName} = getOwnerAndRepo();

	// To extract the tag name from links like "/facebook/react/releases/tag/v16.8.6"
	const tagAnchorRegExp = new RegExp(`\/${ownerName}\/${repoName}\/releases\/tag\/(.*)`);

	// To select all links like "/facebook/react/releases/tag"
	const tagSelector = `*:not(li) > a[href^="/${ownerName}/${repoName}/releases/tag"]`;

	const allTagsAnchor = [...select.all<HTMLAnchorElement>(tagSelector)];
	const lastTagAnchor = allTagsAnchor[allTagsAnchor.length - 1];

	for (let i = 0; i < allTagsAnchor.length - 1; i++) {
		const diffAnchor = allTagsAnchor[i].cloneNode() as HTMLAnchorElement
		diffAnchor.pathname = `/${ownerName}/${repoName}/compare/${extractTagName(allTagsAnchor[i + 1].pathname, tagAnchorRegExp)}...${extractTagName(allTagsAnchor[i].pathname, tagAnchorRegExp)}`;

		appendDiffIcon(diffAnchor, i);
	}

	const nextPageLink = select<HTMLAnchorElement>('.pagination a:last-child');

	if (!nextPageLink) {
		return;
	}

	const firstTagAnchorOfNextPage = await fetchDom(nextPageLink.href, tagSelector) as HTMLAnchorElement;

	lastTagAnchor.pathname = `/${ownerName}/${repoName}/compare/${extractTagName(firstTagAnchorOfNextPage.pathname, tagAnchorRegExp)}...${extractTagName(lastTagAnchor.pathname, tagAnchorRegExp)}`;
}

const compare = () => <div style={{ display: 'inline-block', marginLeft: '5px' }}>Compare</div>

const appendDiffIcon = (anchorTag: HTMLAnchorElement, index: number): void => {
	anchorTag.append(diff());
	anchorTag.append(compare())
	anchorTag.classList.add('muted-link');

	if (isReleaseListPage() || isSingleTagPage()) {
		select(
			'.release > div:first-child > ul',
			select(`.repository-content > .position-relative > .release-entry:nth-child(${index + 1}) > .release`)!
		)!.append(anchorTag);
	}

	if (isTagsListPage()) {
		select('.commit > ul')!.append(anchorTag);
	}
}

const isReleaseListPage = (): boolean => {
	return /^(releases)/.test(getRepoPath()!);
}

const isTagsListPage = (): boolean => {
	return /^(tags)/.test(getRepoPath()!);
}

const isSingleTagPage = (): boolean => {
	return /^(releases\/tag\/)/.test(getRepoPath()!);
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
