import './quick-mention.css';
import React from 'dom-chef';
import select from 'select-dom';
import {ReplyIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';
import * as textFieldEdit from 'text-field-edit';
import delegate, {DelegateEvent} from 'delegate-it';

import {wrap} from '../helpers/dom-utils';
import features from '../feature-manager';
import {getUsername} from '../github-helpers';
import observe from '../helpers/selector-observer';

function prefixUserMention(userMention: string): string {
	// The alt may or may not have it #4859
	return '@' + userMention.replace('@', '');
}

function mentionUser({delegateTarget: button}: DelegateEvent): void {
	const userMention = button.parentElement!.querySelector('img')!.alt;
	const newComment = select('textarea#new_comment_field')!;
	newComment.focus();

	// If the new comment field has selected text, don’t replace it
	newComment.selectionStart = newComment.selectionEnd;

	// If the cursor is preceded by a space (or is at place 0), don't add a space before the mention
	const precedingCharacter = newComment.value.slice(newComment.selectionStart - 1, newComment.selectionStart);
	const spacer = /\s|^$/.test(precedingCharacter) ? '' : ' ';

	// The space after closes the autocomplete box and places the cursor where the user would start typing
	textFieldEdit.insert(newComment, `${spacer}${prefixUserMention(userMention)} `);
}

function add(avatar: HTMLElement): void {
	avatar.style.border = 'solid 5px black';
	const timelineItem = avatar.closest([
		// Regular comments
		'.js-comment-container',

		// Reviews
		'.js-comment',
	].join(', '))!;
	timelineItem.style.border = 'solid 5px red';

	if (
		// TODO: Rewrite with :has()
		// Exclude events that aren't tall enough, like hidden comments or reviews without comments
		!select.exists('.unminimized-comment, .js-comment-container', timelineItem)
	) {
		return;
	}

	timelineItem.style.border = 'solid 5px green';

	// Wrap avatars next to review events so the inserted button doesn't break the layout #4844
	if (avatar.classList.contains('TimelineItem-avatar')) {
		avatar.classList.remove('TimelineItem-avatar');
		wrap(avatar, <div className="avatar-parent-child TimelineItem-avatar d-none d-md-block"/>);
	}

	const userMention = select('img', avatar)!.alt;
	avatar.classList.add('rgh-quick-mention');
	avatar.after(
		<button
			type="button"
			className="rgh-quick-mention tooltipped tooltipped-e btn-link"
			aria-label={`Mention ${prefixUserMention(userMention)} in a new comment`}
		>
			<ReplyIcon/>
		</button>,
	);
}

function init(signal: AbortSignal): void {
	delegate(document, 'button.rgh-quick-mention', 'click', mentionUser, {signal});

	// `:first-child` avoids app badges #2630
	// The hovercard attribute avoids `highest-rated-comment`
	// Avatars next to review events aren't wrapped in a <div> #4844
	observe(`
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
	exclude: [
		pageDetect.isArchivedRepo,
	],
	// Can't because `isArchivedRepo` is DOM-based
	// Also not needed since it appears on hover
	// awaitDomReady: false,
	init,
});

/*

Test URLs

https://github.com/refined-github/sandbox/pull/10

No-comment reviews shouldn't have it:
https://github.com/NixOS/nixpkgs/pull/147010#pullrequestreview-817111882

*/
