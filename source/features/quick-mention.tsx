import './quick-mention.css';

import delegate, {type DelegateEvent} from 'delegate-it';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import ReplyIcon from 'octicons-plain-react/Reply';
import {$, $closestOptional, elementExists} from 'select-dom';
import {insertTextIntoField} from 'text-field-edit';

import features from '../feature-manager.js';
import {getLoggedInUser, isArchivedRepoAsync} from '../github-helpers/index.js';
import {is} from '../helpers/css-selectors.js';
import {wrap} from '../helpers/dom-utils.js';
import observe, {waitForElement} from '../helpers/selector-observer.js';

const fieldSelector = [
	'textarea#new_comment_field',
	'#react-issue-comment-composer textarea',
] as const;

// Old Issue View and PR View
// `:first-child` avoids app badges #2630
// Avatars next to review events aren't wrapped in a <div> #4844
const prCommentSelector = '.js-quote-selection-container '
	+ is(
		'div.TimelineItem-avatar > [data-hovercard-type="user"]:first-child',
		'a.TimelineItem-avatar',
	)
	+ `:not([href="/${getLoggedInUser()!}"])`;

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

function mentionUser({delegateTarget: button}: DelegateEvent): void {
	const userMention = button.parentElement!.querySelector('img')!.alt;
	const newComment = $(fieldSelector);
	newComment.focus();

	// If the new comment field has selected text, don’t replace it
	newComment.selectionStart = newComment.selectionEnd;

	// If the cursor is preceded by a space (or is at place 0), don't add a space before the mention
	const precedingCharacter = newComment.value.slice(newComment.selectionStart - 1, newComment.selectionStart);
	const spacer = /\s|^$/.test(precedingCharacter) ? '' : ' ';

	// The space after closes the autocomplete box and places the cursor where the user would start typing
	insertTextIntoField(newComment, `${spacer}${prefixUserMention(userMention)} `);
}

function add(avatar: HTMLElement): void {
	const timelineItem = $closestOptional([
		// Regular comments
		'.js-comment-container',
		// Reviews
		'.js-comment',
	], avatar);
	const isPr = Boolean(timelineItem);

	if (isPr) {
		if (
			// Exclude events that aren't tall enough, like hidden comments or reviews without comments
			!elementExists('.unminimized-comment, .js-comment-container', timelineItem)
		) {
			return;
		}

		// Wrap avatars next to review events so the inserted button doesn't break the layout #4844
		if (avatar.classList.contains('TimelineItem-avatar')) {
			avatar.classList.remove('TimelineItem-avatar');
			wrap(avatar, <div className="avatar-parent-child TimelineItem-avatar d-none d-md-block" />);
		}
	} else {
		const isHidden = !elementExists('.markdown-body', avatar.parentElement!);
		if (isHidden) {
			return;
		}

		avatar.style.height = 'auto';
		wrap(avatar, <div className="avatar-parent-child d-none d-md-block" />);
	}

	const userMention = $('img', avatar).alt;

	avatar.after(
		<button
			type="button"
			className={['rgh-quick-mention tooltipped tooltipped-e btn-link', isPr ? '' : 'react-view'].join(' ')}
			aria-label={`Mention ${prefixUserMention(userMention)} in a new comment`}
		>
			<ReplyIcon />
		</button>,
	);
}

async function init(signal: AbortSignal): Promise<void> {
	const field = await waitForElement(fieldSelector, {signal});
	if (!field) {
		return;
	}

	delegate('button.rgh-quick-mention', 'click', mentionUser, {signal});

	const isPr = field.id === 'new_comment_field';

	if (isPr) {
		observe(prCommentSelector, add, {signal});
	} else {
		observe(issueCommentSelector, add, {signal});
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isConversation,
	],
	exclude: [
		isArchivedRepoAsync,
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
