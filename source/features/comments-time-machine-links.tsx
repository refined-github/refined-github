import React from 'dom-chef';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import GitHubURL from '../github-helpers/github-url';
import addNotice from '../github-widgets/notice-bar';
import {appendBefore} from '../helpers/dom-utils';
import {buildRepoURL, isPermalink} from '../github-helpers';

async function updateURLtoDatedSha(url: GitHubURL, date: string): Promise<void> {
	const {repository} = await api.v4(`
		repository() {
			ref(qualifiedName: "${url.branch}") {
				target {
					... on Commit {
						history(first: 1, until: "${date}") {
							nodes {
								oid
							}
						}
					}
				}
			}
		}
	`);

	const [{oid}] = repository.ref.target.history.nodes;
	$('a.rgh-link-date')!.pathname = url.assign({branch: oid}).pathname;
}

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
	const dropdown = $('.show-more-popover', comment);

	// Comment-less reviews don't have a dropdown
	if (!dropdown) {
		return;
	}

	appendBefore(dropdown, '.dropdown-divider',
		<>
			<div className="dropdown-divider"/>
			<a
				href={buildRepoURL(`tree/HEAD@{${timestamp}}`)}
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
		if (await isPermalink()) {
			return false;
		}

		const lastCommitDate = await elementReady([
			'.repository-content .Box.Box--condensed relative-time',
			'[itemprop="dateModified"] relative-time' // "Repository refresh" layout
		].join());
		if (date > lastCommitDate?.attributes.datetime.value!) {
			return false;
		}

		const parsedUrl = new GitHubURL(location.href);
		// Due to GitHub’s bug of supporting branches with slashes: #2901
		void updateURLtoDatedSha(parsedUrl, date); // Don't await it, since the link will usually work without the update

		parsedUrl.branch = `${parsedUrl.branch}@{${date}}`;
		url.pathname = parsedUrl.pathname;
	}

	addNotice(
		<>You can also <a className="rgh-link-date" href={String(url)}>view this object as it appeared at the time of the comment</a> (<relative-time datetime={date}/>)</>
	);
}

function init(): void {
	// PR reviews' main content has nested `.timeline-comment`, but the deepest one doesn't have `relative-time`. These are filtered out with `:not([id^="pullrequestreview"])`
	const comments = $$(`
		:not(.js-new-comment-form):not([id^="pullrequestreview"]) > .timeline-comment:not(.rgh-time-machine-links),
		.review-comment > .previewable-edit:not(.is-pending):not(.rgh-time-machine-links)
	`);

	for (const comment of comments) {
		const timestamp = $('relative-time', comment)!.attributes.datetime.value;

		addDropdownLink(comment, timestamp);
		addInlineLinks(comment, timestamp);
		comment.classList.add('rgh-time-machine-links');
	}
}

void features.add(__filebasename, {
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
	awaitDomReady: false,
	init: showTimemachineBar
});
