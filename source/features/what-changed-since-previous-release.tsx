import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import fetchDom from '../libs/fetch-dom';
import {getOwnerAndRepo} from '../libs/utils';

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

		appendCompareIcon(allTagsAnchor[i], diffAnchor);
	}

	const nextPageLink = select<HTMLAnchorElement>('.pagination a:last-child');

	if (!nextPageLink) {
		return;
	}

	const firstTagAnchorOfNextPage = await fetchDom(nextPageLink.href, tagSelector) as HTMLAnchorElement;

	const diffAnchor = lastTagAnchor.cloneNode() as HTMLAnchorElement
	diffAnchor.pathname = `/${ownerName}/${repoName}/compare/${extractTagName(firstTagAnchorOfNextPage.pathname, tagAnchorRegExp)}...${extractTagName(lastTagAnchor.pathname, tagAnchorRegExp)}`;

	appendCompareIcon(lastTagAnchor, diffAnchor);
}

const appendCompareIcon = (anchor: HTMLAnchorElement, compareAnchor: HTMLAnchorElement) => {
	compareAnchor.append(<span>…</span>)
	anchor.after(
		<span className="ellipsis-expander rgh-what-changed">
			{compareAnchor}
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
