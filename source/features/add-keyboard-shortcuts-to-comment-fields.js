import select from 'select-dom';
import delegate from 'delegate';
import {getUsername} from '../libs/utils';

function indentInput(el) {
	const selection = window.getSelection().toString();
	const {selectionStart, selectionEnd, value} = el;
	const linesCount = selection.match(/^|\n/g).length;

	if (linesCount > 1) {
		// Select full first line to replace everything at once
		const firstLineStart = value.lastIndexOf('\n', selectionStart) + 1;
		el.setSelectionRange(firstLineStart, selectionEnd);

		const newSelection = window.getSelection().toString();
		const indentedText = newSelection.replace(
			/^|\n/g, // Match all line starts
			'$&\t'
		);

		// Replace newSelection with indentedText
		document.execCommand('insertText', false, indentedText);

		// Restore selection position, including the indentation
		el.setSelectionRange(
			selectionStart + 1,
			selectionEnd + linesCount
		);
	} else {
		document.execCommand('insertText', false, '\t');
	}
}

export default function () {
	delegate('.js-comment-field', 'keydown', event => {
		const field = event.target;
		if (event.key === 'Tab' && !event.shiftKey) {
			// Don't indent if the suggester box is active
			if (select.exists('.suggester.active')) {
				return;
			}

			indentInput(field);
			event.preventDefault();
		} else if (event.key === 'Enter' && event.shiftKey) {
			const singleCommentButton = select('.review-simple-reply-button', field.form);

			if (singleCommentButton) {
				singleCommentButton.click();
				event.preventDefault();
			}
		} else if (event.key === 'Escape') {
			const inlineCancelButton = select('.js-hide-inline-comment-form', field.form);

			// Cancel comment if inline, blur the field if it's a regular comment
			if (field.value === '') {
				field.blur();
			} else if (inlineCancelButton) {
				inlineCancelButton.click();
			}
		} else if (event.key === 'ArrowUp' && field.id === 'new_comment_field' && field.value === '') {
			const lastOwnComment = select.all(`.js-comment.current-user`).pop();

			if (lastOwnComment) {
				select('.js-comment-edit-button', lastOwnComment).click();

				requestAnimationFrame(() => {
					const commentField = select('.js-comment-field', lastOwnComment);
					const position = commentField.textContent.length;
					commentField.setSelectionRange(position, position);
				});
			}
		}
	});
}
