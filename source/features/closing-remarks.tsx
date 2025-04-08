import React from 'dom-chef';
import {CachedFunction} from 'webext-storage-cache';
import {$$} from 'select-dom';
import {$} from 'select-dom/strict.js';

import TagIcon from 'octicons-plain-react/Tag';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import fetchDom from '../helpers/fetch-dom.js';
import onPrMerge from '../github-events/on-pr-merge.js';
import createBanner, {type BannerProps} from '../github-helpers/banner.js';
import {TimelineItemOld as TimelineItem} from '../github-helpers/timeline-item.js';
import attachElement from '../helpers/attach-element.js';
import {buildRepoURL, getRepo, isRefinedGitHubRepo} from '../github-helpers/index.js';
import {getReleases} from './releases-tab.js';
import observe from '../helpers/selector-observer.js';
import {userHasPushAccess} from '../github-helpers/get-user-permission.js';

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
		const tagsAndBranches = await fetchDom(buildRepoURL('branch_commits', commit));
		const tags = $$('ul.branches-tag-list a', tagsAndBranches);
		// eslint-disable-next-line unicorn/no-array-callback-reference -- Just this once, I swear
		return tags.findLast(excludeNightliesAndJunk)?.textContent ?? false;
	},
	cacheKey: ([commit]) => [getRepo()!.nameWithOwner, commit].join(':'),
});

function createReleaseUrl(): string {
	if (isRefinedGitHubRepo()) {
		return 'https://github.com/refined-github/refined-github/actions/workflows/release.yml';
	}

	return buildRepoURL('releases/new');
}

async function init(signal: AbortSignal): Promise<void> {
	const mergeCommit = $(`.TimelineItem.js-details-container.Details a[href^="/${getRepo()!.nameWithOwner}/commit/" i] > code`).textContent;
	const tagName = await firstTag.get(mergeCommit);

	if (tagName) {
		const tagUrl = buildRepoURL('releases/tag', tagName);

		// Add static box at the bottom
		addExistingTagLinkFooter(tagName, tagUrl);

		// PRs have a regular and a sticky header
		observe('#partial-discussion-header relative-time', addExistingTagLinkToHeader.bind(undefined, tagName, tagUrl), {signal});
	} else {
		void addReleaseBanner(<>This PR seems to be <ExplanationLink>not yet released</ExplanationLink>.</>);
	}
}

function addExistingTagLinkToHeader(tagName: string, tagUrl: string, discussionHeader: HTMLElement): void {
	discussionHeader.parentElement!.append(
		<span>
			<TagIcon className="ml-2 mr-1 color-fg-muted" />
			<a
				href={tagUrl}
				className="commit-ref"
				title={`${tagName} was the first Git tag to include this pull request`}
			>
				{tagName}
			</a>
		</span>,
	);
}

function addExistingTagLinkFooter(tagName: string, tagUrl: string): void {
	const linkedTag = <a href={tagUrl} className="Link--primary text-bold">{tagName}</a>;
	attachElement($('#issue-comment-box'), {
		before: () => (
			<TimelineItem>
				{createBanner({
					icon: <TagIcon className="m-0" />,
					text: <>This pull request first <ExplanationLink>appeared</ExplanationLink> in {linkedTag}</>,
					classes: ['flash-success', 'rgh-bg-none'],
				})}
			</TimelineItem>
		),
	});
}

async function addReleaseBanner(text: string | JSX.Element): Promise<void> {
	const [releases] = await getReleases();
	if (releases === 0) {
		return;
	}

	const url = createReleaseUrl();
	const bannerContent = {
		text,
		icon: <TagIcon className="m-0" />,
		classes: ['rgh-bg-none'],
	} satisfies BannerProps;

	if (await userHasPushAccess()) {
		Object.assign(bannerContent, {
			action: url,
			buttonLabel: 'Draft a new release',
		});
	}

	attachElement($('#issue-comment-box'), {
		before: () => (
			<TimelineItem>
				{createBanner(bannerContent)}
			</TimelineItem>
		),
	});
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
	init(signal: AbortSignal): void {
		onPrMerge(() => addReleaseBanner('Now you can release this change'), signal);
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
