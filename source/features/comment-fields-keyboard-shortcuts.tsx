import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';
import onCommentFieldKeydown from '../github-events/on-comment-field-keydown';

function eventHandler(event: delegate.Event<KeyboardEvent, HTMLTextAreaElement>): void {
	const field = event.delegateTarget;

	if (event.key === 'Escape') {
		// Cancel buttons have different classes for inline comments and editable comments
		const cancelButton = select<HTMLButtonElement>(`
				.js-hide-inline-comment-form,
				.js-comment-cancel-button
			`, field.form!);

		// Cancel if there is a button, else blur the field
		if (cancelButton) {
			cancelButton.click();
		} else {
			field.blur();
		}

		event.stopImmediatePropagation();
		event.preventDefault();
	} else if (event.key === 'ArrowUp' && field.value === '') {
		const currentConversationContainer = field.closest([
			'.js-inline-comments-container', // Current review thread container
			'.discussion-timeline', // Or just ALL the comments in issues
			'#all_commit_comments' // Single commit comments at the bottom
		].join())!;
		const lastOwnComment = select
			.all<HTMLDetailsElement>('.js-comment.current-user', currentConversationContainer)
			.reverse()
			.find(comment => {
				const collapsible = comment.closest('details');
				return !collapsible || collapsible.open;
			});

		if (lastOwnComment) {
			// Make the comment editable (the native edit button might not be available yet)
			const editButton = <button hidden type="button" className="js-comment-edit-button"/>;
			lastOwnComment.append(editButton);
			editButton.click();
			editButton.remove();
			field
				.closest('form')!
				.querySelector<HTMLButtonElement>('.js-hide-inline-comment-form')
				?.click();

			// Move caret to end of field
			requestAnimationFrame(() => {
				select<HTMLTextAreaElement>('.js-comment-field', lastOwnComment)!.selectionStart = Number.MAX_SAFE_INTEGER;
			});
		}
	}
}

function init(): void {
	onCommentFieldKeydown(eventHandler);
}

void features.add({
	id: __filebasename,
	description: 'Adds shortcuts to comment fields: `↑` to edit your previous comment; `esc` to blur field or cancel comment.',
	screenshot: false,
	shortcuts: {
		'↑': 'Edit your last comment',
		esc: 'Unfocuses comment field'
	}
}, {
	include: [
		pageDetect.hasRichTextEditor
	],
	waitForDomReady: false,
	init: onetime(init)
});
