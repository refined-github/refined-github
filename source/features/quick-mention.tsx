import './quick-mention.css';
import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import {ReplyIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';
import * as textFieldEdit from 'text-field-edit';

import features from '.';
import {getUsername} from '../github-helpers';
import onNewComments from '../github-events/on-new-comments';

function mentionUser({delegateTarget: button}: delegate.Event): void {
	const userMention = button.parentElement!.querySelector('img')!.alt;
	const newComment = select('textarea#new_comment_field')!;
	newComment.focus();

	// If the new comment field has selected text, don’t replace it
	newComment.selectionStart = newComment.selectionEnd;

	// If the cursor is preceded by a space (or is at place 0), don't add a space before the mention
	const precedingCharacter = newComment.value.slice(newComment.selectionStart - 1, newComment.selectionStart);
	const spacer = /\s|^$/.test(precedingCharacter) ? '' : ' ';

	// The space after closes the autocomplete box and places the cursor where the user would start typing
	textFieldEdit.insert(newComment, `${spacer}${userMention} `);
}

function init(): void {
	// `:first-child` avoids app badges #2630
	// The hovercard attribute avoids `highest-rated-comment`
	for (const avatar of select.all(`.TimelineItem-avatar > [data-hovercard-type="user"]:first-child:not([href="/${getUsername()}"]):not(.rgh-quick-mention)`)) {
		const userMention = select('img', avatar)!.alt;
		avatar.classList.add('rgh-quick-mention');
		avatar.after(
			<button
				type="button"
				className="rgh-quick-mention tooltipped tooltipped-e btn-link"
				aria-label={`Mention ${userMention} in a new comment`}
			>
				<ReplyIcon/>
			</button>
		);
	}

	delegate(document, 'button.rgh-quick-mention', 'click', mentionUser);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isConversation
	],
	exclude: [
		() => select.exists('.conversation-limited') // Conversation is locked
	],
	additionalListeners: [
		onNewComments
	],
	init
});
