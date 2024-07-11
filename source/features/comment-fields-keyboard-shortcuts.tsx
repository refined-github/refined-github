import React from 'dom-chef';
import {$, $$} from 'select-dom';
import {DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import filterAlteredClicks from 'filter-altered-clicks';

import features from '../feature-manager.js';
import {onCommentFieldKeydown} from '../github-events/on-field-keydown.js';

function handleEscapeKey(event: DelegateEvent<KeyboardEvent, HTMLTextAreaElement>, targetField: HTMLTextAreaElement): void {
	// Cancel buttons have different classes for inline comments and editable comments
	const cancelButton = $(`
		button.js-hide-inline-comment-form,
		button.js-comment-cancel-button
	`, targetField.form!);

	// Cancel if there is a button, else blur the field
	if (cancelButton) {
		cancelButton.click();
	} else {
		targetField.blur();
	}

	event.stopImmediatePropagation();
	event.preventDefault();
}

function handleArrowUpKey(targetField: HTMLTextAreaElement): void {
	const currentConversationContainer = targetField.closest([
		'.js-inline-comments-container', // Current review thread container
		'#discussion_bucket', // Or just ALL the comments in issues
		'#all_commit_comments', // Single commit comments at the bottom
	])!;

	const lastOwnComment
		= $$('.js-comment.current-user', currentConversationContainer)
			.reverse()
			.find(comment => {
				const collapsible = comment.closest('details');
				return !collapsible || collapsible.open;
			});

	if (!lastOwnComment) {
		return;
	}

	// Make the comment editable (the native edit button might not be available yet)
	const editButton = <button hidden type="button" className="js-comment-edit-button"/>;
	lastOwnComment.append(editButton);
	editButton.click();
	editButton.remove();
	targetField
		.closest('form')!
		.querySelector('button.js-hide-inline-comment-form')
		?.click();

	// Move caret to end of the field
	requestAnimationFrame(() => {
		$('textarea.js-comment-field', lastOwnComment)!.selectionStart = Number.MAX_SAFE_INTEGER;
	});
}

const eventHandler = filterAlteredClicks((event: DelegateEvent<KeyboardEvent, HTMLTextAreaElement>): void => {
	const field = event.delegateTarget;

	if (event.key === 'Escape') {
		handleEscapeKey(event, field);
	} else if (event.key === 'ArrowUp' && field.value === '') {
		handleArrowUpKey(field);
	}
});

function init(signal: AbortSignal): void {
	onCommentFieldKeydown(eventHandler, signal);
}

void features.add(import.meta.url, {
	shortcuts: {
		'↑': 'Edit your last comment',
		esc: 'Unfocuses comment field',
	},
	include: [
		pageDetect.hasRichTextEditor,
	],
	init,
});
