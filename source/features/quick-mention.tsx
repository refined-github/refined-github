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

const fieldSelector = [
	'textarea#new_comment_field',
	'#react-issue-comment-composer textarea',
] as const;

// Old Issue View and PR View
// `:first-child` avoids app badges #2630
// Avatars next to review events aren't wrapped in a <div> #4844
const prCommentSelector = `
	.js-quote-selection-container
	:is(
		div.TimelineItem-avatar > [data-hovercard-type="user"]:first-child,
		a.TimelineItem-avatar
	):not([href="/${getUsername()!}"])
`;

const issueCommentSelector = [
	// React Issue View
	`[data-testid="issue-viewer-comments-container"] [class^="LayoutHelpers-module__timelineElement"] a:not([href="/${getUsername()!}"])`,
	// React Issue View (first comment)
	`[data-testid="issue-viewer-issue-container"] a[class^="Avatar-module__avatarLink"]:not([href="/${getUsername()!}"])`,
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

	const isOldView = Boolean(timelineItem);

	if (isOldView) {
		if (debug) {
			timelineItem.style.border = 'solid 5px red';
		}

		if (
			// Exclude events that aren't tall enough, like hidden comments or reviews without comments
			!elementExists('.unminimized-comment, .js-comment-container', timelineItem)
		)
			return;
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

	if (debug) {
		timelineItem.style.border = 'solid 5px green';
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
			className={['rgh-quick-mention tooltipped tooltipped-e btn-link', isOldView ? '' : 'react-view'].join(' ')}
			aria-label={`Mention ${prefixUserMention(userMention!)} in a new comment`}
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

	const controller = new AbortController();
	const field: HTMLTextAreaElement | undefined = await new Promise(resolve => {
		observe(fieldSelector, field => {
			resolve(field);
			controller.abort();
		}, {signal: AbortSignal.any([signal, controller.signal])});
	});

	if (!field) {
		return;
	}

	const isPROrOldView = field.id === 'new_comment_field';
	if (isPROrOldView) {
		observe(prCommentSelector, add, {signal});
	} else {
		observe(issueCommentSelector, add, {signal});
	}
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
