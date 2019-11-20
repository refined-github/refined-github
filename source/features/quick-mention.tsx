import './quick-mention.css';
import React from 'dom-chef';
import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import insertText from 'insert-text-textarea';
import features from '../libs/features';
import * as icons from '../libs/icons';
import {getUsername} from '../libs/utils';

function mentionUser({delegateTarget: button}: DelegateEvent): void {
	const userMention = button.parentElement!.querySelector('img')!.alt;
	const newComment = select<HTMLTextAreaElement>('#new_comment_field')!;
	newComment.focus();

	// If the new comment field has selected text, don’t replace it
	newComment.selectionStart = newComment.selectionEnd;

	// The space before is ignored by Markdown if it's at the start of a new line
	// The space after closes the autocomplete box and places the cursor where the user would start typing
	insertText(newComment, ` ${userMention} `);
}

function init(): void | false {
	if (select.exists('.conversation-limited')) {
		return false; // Discussion is locked
	}

	for (const avatar of select.all(`.TimelineItem-avatar > :not([href="/${getUsername()}"]):not(.rgh-quick-mention)`)) {
		avatar.classList.add('rgh-quick-mention');
		avatar.after(
			<button
				type="button"
				className="rgh-quick-mention tooltipped tooltipped-e btn-link"
				aria-label="Mention user in a new comment"
			>
				{icons.reply()}
			</button>
		);
	}

	delegate('#discussion_bucket', 'button.rgh-quick-mention', 'click', mentionUser);
}

features.add({
	id: __featureName__,
	description: 'Adds a button to @mention a user in discussions',
	screenshot: false,
	include: [
		features.isIssue,
		features.isPRConversation
	],
	load: features.onNewComments,
	init
});
