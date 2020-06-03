import React from 'dom-chef';
import XIcon from 'octicon/x.svg';
import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import GitHubURL from '../github-helpers/github-url';
import {getRepoURL} from '../github-helpers';
import {appendBefore} from '../helpers/dom-utils';

function addInlineLinks(comment: HTMLElement, timestamp: string): void {
	const links = select.all<HTMLAnchorElement>(`
		[href^="${location.origin}"][href*="/blob/"]:not(.rgh-linkified-code),
		[href^="${location.origin}"][href*="/tree/"]:not(.rgh-linkified-code)
	`, comment);

	for (const link of links) {
		const linkParts = link.pathname.split('/');
		// Skip permalinks
		if (/^[\da-f]{40}$/.test(linkParts[4])) {
			continue;
		}

		const searchParameters = new URLSearchParams(link.search);
		searchParameters.set('rgh-link-date', timestamp);
		link.search = String(searchParameters);
	}
}

function addDropdownLink(comment: HTMLElement, timestamp: string): void {
	const dropdown = select('.show-more-popover', comment);

	// Comment-less reviews don't have a dropdown
	if (!dropdown) {
		return;
	}

	appendBefore(dropdown, '.dropdown-divider',
		<>
			<div className="dropdown-divider"/>
			<a
				href={`/${getRepoURL()}/tree/HEAD@{${timestamp}}`}
				className="dropdown-item btn-link"
				role="menuitem"
				title="Browse repository like it appeared on this day"
			>
				View repo at this time
			</a>
		</>
	);
}

async function showTimemachineBar(): Promise<void | false> {
	const url = new URL(location.href); // This can't be replaced with `GitHubURL` because `getCurrentBranch` throws on 404s
	const date = url.searchParams.get('rgh-link-date')!;

	// Drop parameter from current page after using it
	url.searchParams.delete('rgh-link-date');
	history.replaceState(history.state, document.title, url.href);

	if (pageDetect.is404()) {
		const pathnameParts = url.pathname.split('/');
		pathnameParts[4] = `HEAD@{${date}}`;
		url.pathname = pathnameParts.join('/');
	} else {
		// This feature only makes sense if the URL points to a non-permalink
		const branchSelector = await elementReady('.branch-select-menu i');
		const isPermalink = /Tag|Tree/.test(branchSelector!.textContent!);
		if (isPermalink) {
			return false;
		}

		const parsedUrl = new GitHubURL(location.href);
		parsedUrl.branch = `${parsedUrl.branch}@{${date}}`;
		url.pathname = parsedUrl.pathname;
	}

	const closeButton = <button className="flash-close js-flash-close" type="button" aria-label="Dismiss this message"><XIcon/></button>;
	select('#start-of-content')!.after(
		<div className="flash flash-full flash-notice">
			<div className="container-lg px-3">
				{closeButton} You can also <a href={String(url)}>view this object as it appeared at the time of the comment</a> (<relative-time datetime={date}/>)
			</div>
		</div>
	);
}

function init(): void {
	// PR reviews' main content has nested `.timeline-comment`, but the deepest one doesn't have `relative-time`. These are filtered out with `:not([id^="pullrequestreview"])`
	const comments = select.all(`
		:not(.js-new-comment-form):not([id^="pullrequestreview"]) > .timeline-comment:not(.rgh-time-machine-links),
		.review-comment > .previewable-edit:not(.is-pending):not(.rgh-time-machine-links)
	`);

	for (const comment of comments) {
		const timestamp = select('relative-time', comment)!.attributes.datetime.value;

		addDropdownLink(comment, timestamp);
		addInlineLinks(comment, timestamp);
		comment.classList.add('rgh-time-machine-links');
	}
}

void features.add({
	id: __filebasename,
	description: 'Adds links to browse the repository and linked files at the time of each comment.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/56450896-68076680-635b-11e9-8b24-ebd11cc4e655.png'
}, {
	include: [
		pageDetect.hasComments
	],
	init
}, {
	include: [
		pageDetect.is404,
		pageDetect.isSingleFile,
		pageDetect.isRepoTree
	],
	exclude: [
		() => !new URLSearchParams(location.search).has('rgh-link-date')
	],
	waitForDomReady: false,
	init: showTimemachineBar
});
