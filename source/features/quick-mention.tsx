import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import ReplyIcon from 'octicons-plain-react/Reply';
import {$, $optional, closestElement, closestElementOptional, elementExists} from 'select-dom';
import {insertTextIntoField} from 'text-field-edit';

import {withTooltipRef} from '../components/tooltip.js';
import features from '../feature-manager.js';
import getCommentAuthor from '../github-helpers/get-comment-author.js';
import {getLoggedInUser, isArchivedRepoAsync, scrollIntoViewIfNeeded} from '../github-helpers/index.js';
import {commentMenuButton, legacyCommentField, prCommentMenu} from '../github-helpers/selectors.js';
import {appendBefore} from '../helpers/dom-utils.js';
import onElementRemoval from '../helpers/on-element-removal.js';
import observe, {waitForElement} from '../helpers/selector-observer.js';

const fieldSelector = [
	legacyCommentField,
	'#react-issue-comment-composer textarea',
] as const;

function prefixUserMention(userMention: string): string {
	// The alt may or may not have it #4859
	return '@' + userMention.replace('@', '').replace(/\[bot\]$/, '');
}

// Review comments are answered in their own thread, everything else uses the main field
function getCommentField(comment: Element): HTMLTextAreaElement {
	const thread = closestElementOptional('.review-thread-component', comment);
	const form = thread && $optional('.inline-comment-form-container', thread);
	if (!form) {
		return $(fieldSelector);
	}

	if (!form.classList.contains('open')) {
		$('.js-toggle-inline-comment-form', form).click();
	}

	return $('textarea.js-comment-field', form);
}

function mentionUser(author: string, comment: Element): void {
	const newComment = getCommentField(comment);
	newComment.focus();

	// If the new comment field has selected text, don’t replace it
	newComment.selectionStart = newComment.selectionEnd;

	// If the cursor is preceded by a space (or is at place 0), don't add a space before the mention
	const precedingCharacter = newComment.value.slice(newComment.selectionStart - 1, newComment.selectionStart);
	const spacer = /\s|^$/.test(precedingCharacter) ? '' : ' ';

	// The space after closes the autocomplete box and places the cursor where the user would start typing
	insertTextIntoField(newComment, `${spacer}${prefixUserMention(author)} `);

	// Safari doesn't scroll to the field on `focus()` or `execCommand`
	scrollIntoViewIfNeeded(newComment);
}

async function addQuickMentionIssue(menuButton: HTMLButtonElement, {signal}: SignalAsOptions): Promise<void> {
	const author = getCommentAuthor(menuButton);

	// Not on your own comments
	if (author === getLoggedInUser()) {
		return;
	}

	const mentionButton = (
		<button
			ref={withTooltipRef(`Mention ${prefixUserMention(author)} in a new comment`)}
			type="button"
			className="Button Button--iconOnly Button--invisible Button--small"
			onClick={() => {
				mentionUser(author, menuButton);
			}}
		>
			<ReplyIcon />
		</button>
	);
	// Keep it to the left of the hidden comment expander and `quick-comment-edit`, which attach to the same menu
	appendBefore(menuButton.parentElement!, 'button:has(.octicon)', mentionButton);

	// Remove our button when React replaces the menu, preventing duplicates
	await onElementRemoval(menuButton, signal);
	mentionButton.remove();
}

function addQuickMentionPr(commentDropdown: HTMLDetailsElement): void {
	const comment = closestElement('.js-comment', commentDropdown);

	// Exclude hidden comments and reviews without comments
	if (!elementExists('.markdown-body', comment)) {
		return;
	}

	const author = getCommentAuthor(comment);

	// Not on your own comments
	if (author === getLoggedInUser()) {
		return;
	}

	const mentionButton = (
		<button
			ref={withTooltipRef(`Mention ${prefixUserMention(author)} in a new comment`)}
			type="button"
			className="timeline-comment-action btn-link rgh-quick-mention"
			aria-label={`Mention ${prefixUserMention(author)} in a new comment`}
			onClick={() => {
				mentionUser(author, comment);
			}}
		>
			<ReplyIcon />
		</button>
	);

	// Keep it to the left of `quick-comment-edit`, which attaches to the same dropdown
	appendBefore(commentDropdown.parentElement!, '.rgh-quick-comment-edit-button, details:last-child', mentionButton);
}

function init(signal: AbortSignal): void {
	if (pageDetect.isPR()) {
		observe(prCommentMenu, addQuickMentionPr, {signal});
	} else {
		observe(commentMenuButton, addQuickMentionIssue, {signal});
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

https://github.com/refined-github/sandbox/issues/131
https://github.com/refined-github/sandbox/pull/10

- Locked issue (own repo): https://github.com/refined-github/sandbox/issues/74
- Locked issue (other repo): https://togithub.com/eslint/eslint/issues/8213
- Comment with app badge: https://togithub.com/biomejs/biome/issues/1927#issuecomment-2227203261

*/
