import './quick-mention.css';

import delegate, {type DelegateEvent} from 'delegate-it';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import ReplyIcon from 'octicons-plain-react/Reply';
import {$, $closest, elementExists} from 'select-dom';
import {insertTextIntoField} from 'text-field-edit';

import features from '../feature-manager.js';
import {getLoggedInUser, isArchivedRepoAsync} from '../github-helpers/index.js';
import {is} from '../helpers/css-selectors.js';
import {wrap} from '../helpers/dom-utils.js';
import observe, {waitForElement} from '../helpers/selector-observer.js';

const prFieldSelector = 'textarea#new_comment_field';
const issueFieldSelector = '#react-issue-comment-composer textarea';
const fieldSelector = [prFieldSelector, issueFieldSelector] as const;

const loggedInUser = getLoggedInUser()!;

const prAvatarSelector = '.js-quote-selection-container '
	+ is(
		// `:first-child` avoids app badges #2630
		'div.TimelineItem-avatar > [data-hovercard-type="user"]:first-child', // Comment
		'a.TimelineItem-avatar', // Review or PR body
	)
	+ `:not([href="/${loggedInUser}"])`;

const issueAvatarSelector
	= `a[class^="Avatar-module__avatarLink"][class*="avatarOuter"]:not([href$="/${loggedInUser}"])`;

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

function addButton(avatar: HTMLElement): void {
	const userMention = $('img', avatar).alt;
	avatar.after(
		<button
			type="button"
			className="rgh-quick-mention tooltipped tooltipped-e btn-link"
			aria-label={`Mention ${prefixUserMention(userMention)} in a new comment`}
		>
			<ReplyIcon />
		</button>,
	);
}

function addButtonPr(avatar: HTMLElement): void {
	const timelineItem = $closest([
		// Regular comments
		'.js-comment-container',
		// Reviews
		'.js-comment',
	], avatar);

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

	addButton(avatar);
}

function addButtonIssue(avatar: HTMLElement): void {
	const isHidden = !elementExists('.markdown-body', avatar.parentElement!);
	if (isHidden) {
		return;
	}

	avatar.style.height = 'auto';
	avatar.classList.add('react-view');
	wrap(avatar, <div className="avatar-parent-child d-none d-md-block" />);

	addButton(avatar);
}

async function init(signal: AbortSignal): Promise<void> {
	delegate('button.rgh-quick-mention', 'click', mentionUser, {signal});

	if (pageDetect.isPR()) {
		observe(prAvatarSelector, addButtonPr, {signal});
	} else {
		observe(issueAvatarSelector, addButtonIssue, {signal});
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isConversation,
	],
	exclude: [
		async () => !await waitForElement(fieldSelector),
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
