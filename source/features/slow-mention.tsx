import './slow-mention.css';

import React from 'dom-chef';
import {$} from 'select-dom/strict.js';
import {elementExists} from 'select-dom';
import ReplyIcon from 'octicons-plain-react/Reply';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils.js';
import features from '../feature-manager.js';
import {getLoggedInUser, isArchivedRepoAsync} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';

const prCommentSelector = `
	.js-quote-selection-container
	:is(
		div.TimelineItem-avatar > [data-hovercard-type="user"]:first-child,
		a.TimelineItem-avatar
	):not([href="/${getLoggedInUser()!}"])
`;

const issueCommentSelector = [
	// React Issue View
	`[data-testid="issue-viewer-comments-container"] [class^="LayoutHelpers-module__timelineElement"] a:not([href="/${getLoggedInUser()!}"])`,
	// React Issue View (first comment)
	`[data-testid="issue-viewer-issue-container"] a[class^="Avatar-module__avatarLink"]:not([href="/${getLoggedInUser()!}"])`,
];

function prefixUserMention(userMention: string): string {
	// The alt may or may not have it #4859
	return '@' + userMention.replace('@', '').replace(/\[bot\]$/, '');
}

function openProfilePage(avatar: HTMLElement): void {
	const profileLink = avatar.closest('a') ?? $('a', avatar)!;
	window.open(profileLink.href, '_blank');
}

function add(avatar: HTMLElement): void {
	const timelineItem = avatar.closest([
		// Regular comments
		'.js-comment-container',

		// Reviews
		'.js-comment',
	])!;

	const isOldView = Boolean(timelineItem);

	if (isOldView) {
		if (
			// Exclude events that aren't tall enough, like hidden comments or reviews without comments
			!elementExists('.unminimized-comment, .js-comment-container', timelineItem)
		) {
			return;
		}
	} else {
		// Make sure the comment isn't hidden
		const contentItem = avatar.parentElement!.querySelector([
			'[data-testid="comment-header"] + div',
			'.react-issue-body', // First comment in React issues view
		])!;

		if (!contentItem) {
			return;
		}
	}

	// Wrap avatars next to review events so the inserted button doesn't break the layout #4844
	if (avatar.classList.contains('TimelineItem-avatar')) {
		avatar.classList.remove('TimelineItem-avatar');
		wrap(avatar, <div className="avatar-parent-child TimelineItem-avatar d-none d-md-block" />);
	}

	if (!isOldView) {
		avatar.style.height = 'auto';
		wrap(avatar, <div className="avatar-parent-child d-none d-md-block" />);
	}

	const userMention = $('img', avatar).alt;

	avatar.after(
		<button
			type="button"
			className={['rgh-slow-mention tooltipped tooltipped-e btn-link', isOldView ? '' : 'react-view'].join(' ')}
			aria-label={`Open ${prefixUserMention(userMention)}'s profile in a new tab`}
			onClick={() => openProfilePage(avatar)}
		>
			<ReplyIcon />
		</button>,
	);
}

async function init(signal: AbortSignal): Promise<void> {
	if (await isArchivedRepoAsync()) {
		return;
	}

	observe(prCommentSelector, add, {signal});
	observe(issueCommentSelector, add, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isConversation,
	],
	init,
});

/*

Test URLs

https://github.com/refined-github/sandbox/pull/10

No-comment reviews shouldn't have it:
https://github.com/NixOS/nixpkgs/pull/147010#pullrequestreview-817111882

- Locked issue (own repo): https://github.com/refined-github/sandbox/issues/74
- Locked issue (other repo): https://github.com/eslint/eslint/issues/8213
- Comment with app badge:
	- https://github.com/dotnet/docs/issues/10085
	- https://github.com/biomejs/biome/issues/1927#issuecomment-2227203261

*/
