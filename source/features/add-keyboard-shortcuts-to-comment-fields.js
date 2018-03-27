import select from 'select-dom';
import delegate from 'delegate';
import indentTextarea from '../libs/indent-textarea';
import {registerShortcut} from './improve-shortcut-help';

// Element.blur() will reset the tab focus to the start of the document.
// This places it back next to the blurred field
function blurAccessibly(field) {
	field.blur();

	const range = new Range();
	const selection = getSelection();
	const focusHolder = new Text();
	field.after(focusHolder);
	range.selectNodeContents(focusHolder);
	selection.removeAllRanges();
	selection.addRange(range);
	focusHolder.remove();
}

export default function () {
	registerShortcut('issues', '↑', 'Edit your last comment');
	registerShortcut('prFiles', 'shift enter', 'Leave a single comment');

	delegate('.js-comment-field', 'keydown', event => {
		const field = event.target;
		if (event.key === 'Tab' && !event.shiftKey) {
			// Don't indent if the suggester box is active
			if (select.exists('.suggester.active')) {
				return;
			}

			indentTextarea(field);
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
				blurAccessibly(field);
			} else if (inlineCancelButton) {
				inlineCancelButton.click();
			}
		} else if (event.key === 'ArrowUp' && field.id === 'new_comment_field' && field.value === '') {
			const lastOwnComment = select.all(`.js-comment.current-user`).pop();

			if (lastOwnComment) {
				select('.js-comment-edit-button', lastOwnComment).click();

				// Move caret to end of field
				requestAnimationFrame(() => {
					select('.js-comment-field', lastOwnComment).selectionStart = Number.MAX_SAFE_INTEGER;
				});
			}
		}
	});
}
