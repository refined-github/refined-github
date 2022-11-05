import { css } from 'code-tag';
import React from 'dom-chef';
import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import delegate, { DelegateEvent } from 'delegate-it';

import features from '../feature-manager';
import * as api from '../github-helpers/api';
import GitHubURL from '../github-helpers/github-url';
import addNotice from '../github-widgets/notice-bar';
import {linkifiedURLClass} from '../github-helpers/dom-formatters';
import {buildRepoURL, isPermalink} from '../github-helpers';
import observe from '../helpers/selector-observer';

function getKeyForURL(url: Location | HTMLAnchorElement): string {
	return 'rgh-time-machine-' + url.pathname;
}

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
	select('a.rgh-link-date')!.pathname = url.assign({branch: oid}).pathname;
}

async function showTimeMachineBar(): Promise<void | false> {
	const date = sessionStorage.getItem(getKeyForURL(location));
	if (!date) {
		return false;
	}

	// Drop parameter from storage after using it
	// sessionStorage.removeItem(getKeyForURL(location))

	const url = new URL(location.href); // This can't be replaced with `GitHubURL` because `getCurrentCommittish` throws on 404s

	if (pageDetect.is404()) {
		const pathnameParts = url.pathname.split('/');
		pathnameParts[4] = `HEAD@{${date}}`;
		url.pathname = pathnameParts.join('/');
	} else {
		// This feature only makes sense if the URL points to a non-permalink
		if (await isPermalink()) {
			return false;
		}

		// Selector note: isRepoFile and isRepoTree have different DOM for this element
		const lastCommitDate = await elementReady('.Box-header relative-time', {waitForChildren: false});
		if (lastCommitDate && date > lastCommitDate.getAttribute('datetime')!) {
			return false;
		}

		const parsedUrl = new GitHubURL(location.href);
		// Due to GitHub’s bug of supporting branches with slashes: #2901
		void updateURLtoDatedSha(parsedUrl, date); // Don't await it, since the link will usually work without the update

		parsedUrl.branch = `${parsedUrl.branch}@{${date}}`;
		url.pathname = parsedUrl.pathname;
	}

	const link = (
		<a className="rgh-link-date" href={url.href} data-turbo-frame="repo-content-turbo-frame">
			view this object as it appeared at the time of the comment
		</a>
	);
	await addNotice(
		<>You can also {link} (<relative-time datetime={date}/>)</>,
	);
}

function getCommentTimeStamp(elementInsideComment: HTMLElement): string {
	// The timestamp of main review comments isn't in their header but in the timeline event above #5423
	return elementInsideComment
		.closest('.js-comment:not([id^="pullrequestreview-"]), .js-timeline-item')!
		.querySelector('relative-time')!
		.attributes.datetime.value;
}

function onLinkInsideCommentVisit({delegateTarget: link}: DelegateEvent<MouseEvent, HTMLAnchorElement>): void {
	const [, _user, _repo, linkType, ref] = link.pathname.split('/');
	// Skip non-object links (double-check because the the delegate selector can't do this safely)
	// Skip known permalinks
	if (['blob', 'tree'].includes(linkType) && !/^[\da-f]{40}$/.test(ref)) {
		sessionStorage.setItem(getKeyForURL(link), getCommentTimeStamp(link));
	}
}

function addDropdownLink(menu: HTMLElement): void {
	if (menu.closest('.js-pending-review-comment')) {
		return;
	}

	const timestamp = getCommentTimeStamp(menu);
	menu.append(
		<div className="dropdown-divider"/>,
		<a
			href={buildRepoURL(`tree/HEAD@{${timestamp}}`)}
			className={'dropdown-item btn-link ' + linkifiedURLClass}
			role="menuitem"
			title="Browse repository like it appeared on this day"
		>
			View repo at this time
		</a>,
	);
}

function init(signal: AbortSignal): void {

	const possibleObjectLinks = css`
		a[href^="${location.origin}"]:not(
			.${linkifiedURLClass}
		):is(
			[href*="/blob/"],
			[href*="/tree/"]
		)
	`;

	observe(possibleObjectLinks, console.warn, {signal});
	observe('.timeline-comment-actions .show-more-popover', addDropdownLink, {signal});
	delegate(document, possibleObjectLinks, 'click', onLinkInsideCommentVisit, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasComments,
	],
	exclude: [
		pageDetect.isGist,
	],
	awaitDomReady: false,
	init,
}, {
	include: [
		pageDetect.is404,
		pageDetect.isSingleFile,
		pageDetect.isRepoTree,
	],
	awaitDomReady: false,
	init: showTimeMachineBar,
});

/*
Test URLs

Find them in https://github.com/refined-github/refined-github/pull/1863
*/
