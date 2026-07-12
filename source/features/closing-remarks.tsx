import React from 'dom-chef';
import {$, $$optional} from 'select-dom';
import {CachedFunction} from 'webext-storage-cache';

import * as pageDetect from 'github-url-detection';
import TagIcon from 'octicons-plain-react/Tag';

import features from '../feature-manager.js';
import waitForPrMerge from '../github-events/on-pr-merge.js';
import createBanner, {type BannerProps} from '../github-helpers/banner.js';
import {userHasPushAccess} from '../github-helpers/get-user-permission.js';
import {buildRepoUrl, getRepo, isRefinedGitHubRepo} from '../github-helpers/index.js';
import {commentBoxHashPr} from '../github-helpers/selectors.js';
import TimelineItem from '../github-helpers/timeline-item.js';
import fetchDom from '../helpers/fetch-dom.js';
import observe from '../helpers/selector-observer.js';
import {getReleasesCount} from './releases-tab.js';

function excludeNightliesAndJunk({textContent}: HTMLAnchorElement): boolean {
	// https://github.com/refined-github/refined-github/issues/7206
	return !textContent.includes('nightly') && /\d[.]\d/.test(textContent);
}

function ExplanationLink(): JSX.Element {
	return (
		<a href="https://github.com/refined-github/refined-github/wiki/Extended-feature-descriptions#closing-remarks" />
	);
}

const firstTag = new CachedFunction('first-tag', {
	async updater(commit: string): Promise<string | false> {
		const tagsAndBranches = await fetchDom(buildRepoUrl('branch_commits', commit));
		const tags = $$optional('ul.branches-tag-list a', tagsAndBranches);
		// eslint-disable-next-line unicorn/no-array-callback-reference -- Just this once, I swear
		return tags.findLast(excludeNightliesAndJunk)?.textContent ?? false;
	},
	cacheKey: ([commit]) => [getRepo()!.nameWithOwner, commit].join(':'),
});

function createReleaseUrl(): string {
	if (isRefinedGitHubRepo()) {
		return 'https://github.com/refined-github/refined-github/actions/workflows/release.yml';
	}

	return buildRepoUrl('releases/new');
}

function addTagToHeader(tagName: string, tagUrl: string, relativeTime: HTMLElement): void {
	relativeTime.parentElement!.append(
		<a
			href={tagUrl}
			className="text-bold Link--primary no-underline"
			title={`${tagName} was the first Git tag to include this pull request`}
		>
			<TagIcon className="ml-2 tmp-ml-2 mr-1 tmp-mr-1 color-fg-muted" />
			{tagName}
		</a>,
	);
}

function addTagToFooter(tagName: string, tagUrl: string, signal: AbortSignal): void {
	// Use observer because GitHub might remove the box
	// https://github.com/refined-github/refined-github/issues/9460
	observe(commentBoxHashPr, anchor => {
		const linkedTag = <a href={tagUrl} className="Link--primary text-bold">{tagName}</a>;
		anchor.before(
			<TimelineItem>
				{createBanner({
					icon: <TagIcon className="m-0 tmp-m-0" />,
					text: <>
						This pull request first <ExplanationLink>appeared</ExplanationLink> in {linkedTag}
					</>,
					classes: ['flash-success', 'rgh-bg-none'],
				})}
			</TimelineItem>,
		);
	}, {signal});
}

async function addReleaseBanner(text: string | JSX.Element, signal: AbortSignal): Promise<void> {
	const [releases] = await getReleasesCount();
	if (releases === 0) {
		return;
	}

	const url = createReleaseUrl();
	const bannerContent = {
		text,
		icon: <TagIcon className="m-0 tmp-m-0" />,
		classes: ['rgh-bg-none'],
	} satisfies BannerProps;

	if (await userHasPushAccess()) {
		Object.assign(bannerContent, {
			action: url,
			buttonLabel: 'Draft a new release',
		});
	}

	// Create outside observer because `text` can be a document fragment, which can only be appended once
	// https://github.com/refined-github/refined-github/pull/9808
	const item = (
		<TimelineItem>
			{createBanner(bannerContent)}
		</TimelineItem>
	);

	// Use observer because GitHub might remove the box
	// https://github.com/refined-github/refined-github/issues/9460
	observe(commentBoxHashPr, anchor => {
		anchor.before(item);
	}, {signal});
}

async function init(signal: AbortSignal): Promise<void> {
	const mergeCommit = $(`.TimelineItem.js-details-container.Details a[href^="/${getRepo()!.nameWithOwner}/commit/" i]`);
	const {hash} = /commit\/(?<hash>[0-9a-f]{40})/.exec(mergeCommit.pathname)!.groups!;
	const tagName = await firstTag.get(hash);

	if (tagName) {
		const tagUrl = buildRepoUrl('releases/tag', tagName);

		// Add static box at the bottom
		addTagToFooter(tagName, tagUrl, signal);

		// PRs have a regular and a sticky header
		observe('[class*="PullRequestHeaderSummary"] relative-time', addTagToHeader.bind(undefined, tagName, tagUrl), {
			signal,
		});
		return;
	}

	void addReleaseBanner(
		<>
			No <ExplanationLink>stable version tags</ExplanationLink> for this PR.
		</>,
		signal,
	);
}

void features.add(import.meta.url, {
	// When arriving on an already-merged PR
	asLongAs: [
		pageDetect.isPRConversation,
		pageDetect.isMergedPR,
	],
	awaitDomReady: true, // It must look for the merge commit
	init,
}, {
	// This catches a PR while it's being merged
	asLongAs: [
		pageDetect.isPRConversation,
		pageDetect.isOpenConversation,
		userHasPushAccess,
	],
	awaitDomReady: true, // Post-load user event, no need to listen earlier
	async init(signal: AbortSignal): Promise<void> {
		await waitForPrMerge(signal);
		await addReleaseBanner('Now you can release this change', signal);
	},
});

/*
Test URLs

- PR: https://github.com/refined-github/refined-github/pull/5600
- Locked PR: https://github.com/eslint/eslint/pull/17
- Archived repo: https://github.com/fregante/iphone-inline-video/pull/130
- Junk tag: https://github.com/refined-github/sandbox/pull/1
	- See: https://github.com/refined-github/sandbox/branch_commits/f743c334f6475021ef133591b587bc282c0cf4c4
- Normal tag: https://togithub.com/refined-github/refined-github/pull/7127
	- See https://github.com/refined-github/refined-github/branch_commits/5321825
- Nightly tag: https://togithub.com/neovim/neovim/pull/22060
	- see: https://github.com/neovim/neovim/branch_commits/27b81af

*/
