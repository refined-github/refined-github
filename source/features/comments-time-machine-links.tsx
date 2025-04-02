import React from 'dom-chef';
import {$, $$optional} from 'select-dom/strict.js';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import GitHubFileURL from '../github-helpers/github-file-url.js';
import addNotice from '../github-widgets/notice-bar.js';
import {linkifiedURLClass} from '../github-helpers/dom-formatters.js';
import {buildRepoURL, isPermalink} from '../github-helpers/index.js';
import {saveOriginalHref} from './sort-conversations-by-update-time.js';
import observe from '../helpers/selector-observer.js';
import GetCommitAtDate from './comments-time-machine-links.gql';
import {expectToken} from '../github-helpers/github-token.js';
import getDefaultBranch from '../github-helpers/get-default-branch.js';

async function updateURLtoDatedSha(url: GitHubFileURL, date: string): Promise<void> {
	const {repository} = await api.v4(GetCommitAtDate, {variables: {date, branch: url.branch}});

	const [{oid}] = repository.ref.target.history.nodes;
	$('a.rgh-link-date').pathname = url.assign({branch: oid}).pathname;
}

async function showTimeMachineBar(): Promise<void | false> {
	const url = new URL(location.href); // This can't be replaced with `GitHubFileURL` because `getCurrentGitRef` throws on 404s
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

		// Selector note: isRepoFile and isRepoTree have different DOM for this element
		const lastCommitDate = await elementReady('.Box-header relative-time', {waitForChildren: false});
		if (lastCommitDate && date > lastCommitDate.getAttribute('datetime')!) {
			return false;
		}

		const parsedUrl = new GitHubFileURL(location.href);

		// Handle `isRepoHome` #4979
		parsedUrl.branch ||= await getDefaultBranch();
		parsedUrl.route ||= 'tree';

		// Due to GitHub’s bug of supporting branches with slashes: #2901
		void updateURLtoDatedSha(parsedUrl, date); // Don't await it, since the link will usually work without the update

		// Set temporary URL AFTER calling `updateURLtoDatedSha`
		parsedUrl.branch = `${parsedUrl.branch}@{${date}}`;

		// Use new path in link
		url.pathname = parsedUrl.pathname;
	}

	const link = (
		<a className="rgh-link-date" href={url.href}>
			view this object as it appeared at the time of the comment
		</a>
	);
	await addNotice(
		<>You can also {link} (<relative-time datetime={date} />)</>,
	);
}

function addInlineLinks(comment: HTMLElement, timestamp: string): void {
	for (const link of $$optional(`a[href^="${location.origin}"]:not(.${linkifiedURLClass})`, comment)) {
		if (!pageDetect.isRepoGitObject(link)) {
			continue;
		}

		// Skip permalinks
		const linkParts = link.pathname.split('/');
		if (/^[\da-f]{40}$/.test(linkParts[4])) {
			continue;
		}

		saveOriginalHref(link);

		const searchParameters = new URLSearchParams(link.search);
		searchParameters.set('rgh-link-date', timestamp);
		link.search = String(searchParameters);
	}
}

function addDropdownLink(menu: HTMLElement, timestamp: string): void {
	$('.show-more-popover', menu.parentElement!).append(
		<div className="dropdown-divider" />,
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

async function init(signal: AbortSignal): Promise<void> {
	await expectToken();

	observe('.timeline-comment-actions > details:last-child', menu => {
		if (menu.closest('.js-pending-review-comment')) {
			return;
		}

		// The timestamp of main review comments isn't in their header but in the timeline event above #5423
		const timestamp = menu
			.closest(['.js-comment:not([id^="pullrequestreview-"])', '.js-timeline-item'])!
			.querySelector('relative-time')!
			.attributes
			.datetime
			.value;

		addInlineLinks(menu.closest('.js-comment')!, timestamp);
		addDropdownLink(menu, timestamp);
	}, {signal});

	observe([
		'div.react-issue-comment', // Comments
		'div.react-issue-body', // First comment
		'[data-testid="review-thread"] > div',
	], comment => {
		const timestamp = $('relative-time', comment).attributes.datetime.value;
		addInlineLinks(comment, timestamp);
	}, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasComments,
	],
	exclude: [
		pageDetect.isGist,
	],
	init,
}, {
	asLongAs: [
		() => new URLSearchParams(location.search).has('rgh-link-date'),
	],
	include: [
		pageDetect.is404,
		pageDetect.isSingleFile,
		pageDetect.isRepoTree,
	],
	init: showTimeMachineBar,
});

/*
Test URLs

Find them in https://github.com/refined-github/refined-github/pull/1863

See the bar on:

- https://github.com/sindresorhus/refined-github/blob/main/source/features/mark-merge-commits-in-list.tsx?rgh-link-date=2019-03-04T13%3A04%3A18Z
*/
