import './quick-mention.css';
import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import ReplyIcon from 'octicon/reply.svg';
import * as textFieldEdit from 'text-field-edit';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import {getUsername} from '../libs/utils';
import onNewComments from '../libs/on-new-comments';

function mentionUser({delegateTarget: button}: delegate.Event): void {
	const userMention = button.parentElement!.querySelector('img')!.alt;
	const newComment = select<HTMLTextAreaElement>('#new_comment_field')!;
	newComment.focus();

	// If the new comment field has selected text, don’t replace it
	newComment.selectionStart = newComment.selectionEnd;

	// If the cursor is preceded by a space (or is at place 0), don't add a space before the mention
	const precedingCharacter = newComment.value.slice(newComment.selectionStart - 1, newComment.selectionStart);
	const spacer = /\s|^$/.test(precedingCharacter) ? '' : ' ';

	// The space after closes the autocomplete box and places the cursor where the user would start typing
	textFieldEdit.insert(newComment, `${spacer}${userMention} `);
}

function init(): void | false {
	if (select.exists('.conversation-limited')) {
		return false; // Discussion is locked
	}

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

features.add({
	id: __filebasename,
	description: 'Adds a button to @mention a user in discussions.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/70406615-f445d580-1a73-11ea-9ab1-bf6bd9aa70a3.gif'
}, {
	include: [
		pageDetect.isIssue,
		pageDetect.isPRConversation
	],
	additionalListeners: [
		onNewComments
	],
	init
});
