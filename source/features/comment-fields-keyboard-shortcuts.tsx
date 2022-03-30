import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {onCommentFieldKeydown} from '../github-events/on-field-keydown';

function eventHandler(event: delegate.Event<KeyboardEvent, HTMLTextAreaElement>): void {
	const field = event.delegateTarget;

	if (event.key === 'Escape') {
		// Cancel buttons have different classes for inline comments and editable comments
		const cancelButton = select(`
			button.js-hide-inline-comment-form,
			button.js-comment-cancel-button
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
			'#discussion_bucket', // Or just ALL the comments in issues
			'#all_commit_comments', // Single commit comments at the bottom
		].join(','))!;
		const lastOwnComment = select
			.all('.js-comment.current-user', currentConversationContainer)
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
				.querySelector('button.js-hide-inline-comment-form')
				?.click();

			// Move caret to end of field
			requestAnimationFrame(() => {
				select('textarea.js-comment-field', lastOwnComment)!.selectionStart = Number.MAX_SAFE_INTEGER;
			});
		}
	}
}

function init(): Deinit {
	return onCommentFieldKeydown(eventHandler);
}

void features.add(import.meta.url, {
	shortcuts: {
		'↑': 'Edit your last comment',
		esc: 'Unfocuses comment field',
	},
	include: [
		pageDetect.hasRichTextEditor,
	],
	awaitDomReady: false,
	deduplicate: 'has-rgh-inner',
	init,
});
