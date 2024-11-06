import './quick-mention.css';

import React from 'dom-chef';
import {$} from 'select-dom/strict.js';
import {elementExists} from 'select-dom';
import ReplyIcon from 'octicons-plain-react/Reply';
import * as pageDetect from 'github-url-detection';
import {insertTextIntoField} from 'text-field-edit';
import delegate, {type DelegateEvent} from 'delegate-it';

import {wrap} from '../helpers/dom-utils.js';
import features from '../feature-manager.js';
import {getUsername, isArchivedRepoAsync} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';

const fieldSelector = 'textarea#new_comment_field';

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

const debug = false;

function add(avatar: HTMLElement): void {
	if (debug) {
		avatar.style.border = 'solid 5px black';
	}

	const timelineItem = avatar.closest([
		// Regular comments
		'.js-comment-container',

		// Reviews
		'.js-comment',
	])!;
	if (debug) {
		timelineItem.style.border = 'solid 5px red';
	}

	if (
		// TODO: Rewrite with :has()
		// Exclude events that aren't tall enough, like hidden comments or reviews without comments
		!elementExists('.unminimized-comment, .js-comment-container', timelineItem)
	) {
		return;
	}

	if (debug) {
		timelineItem.style.border = 'solid 5px green';
	}

	// Wrap avatars next to review events so the inserted button doesn't break the layout #4844
	if (avatar.classList.contains('TimelineItem-avatar')) {
		avatar.classList.remove('TimelineItem-avatar');
		wrap(avatar, <div className="avatar-parent-child TimelineItem-avatar d-none d-md-block" />);
	}

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

async function init(signal: AbortSignal): Promise<void> {
	if (await isArchivedRepoAsync()) {
		return;
	}

	delegate('button.rgh-quick-mention', 'click', mentionUser, {signal});

	// `:first-child` avoids app badges #2630
	// The hovercard attribute avoids `highest-rated-comment`
	// Avatars next to review events aren't wrapped in a <div> #4844
	// :has(fieldSelector) enables the feature only when/after the "mention" button can actually work
	// .js-quote-selection-container selects the closest parent that contains both the new comment field and the avatar #7378
	observe(`
		.js-quote-selection-container:has(${fieldSelector})
		:is(
			div.TimelineItem-avatar > [data-hovercard-type="user"]:first-child,
			a.TimelineItem-avatar
		):not([href="/${getUsername()!}"])
	`, add, {signal});
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
