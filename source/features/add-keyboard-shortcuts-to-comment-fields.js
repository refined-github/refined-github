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

	delegate('.js-comment-field', 'keydown', event => {
		const field = event.target;

		// Don't do anything if the suggester box is active
		if (select.exists('.suggester:not([hidden])', field.form)) {
			return;
		}

		if (event.key === 'Tab' && !event.shiftKey) {
			indentTextarea(field);
			event.preventDefault();
		} else if (event.key === 'Escape') {
			// Cancel buttons have different classes for inline comments and editable comments
			const cancelButton = select(`
				.js-hide-inline-comment-form,
				.js-comment-cancel-button
			`, field.form);

			// Cancel if there is a button, else blur the field
			if (cancelButton) {
				cancelButton.click();
			} else {
				blurAccessibly(field);
			}
			event.stopImmediatePropagation();
			event.preventDefault();
		} else if (event.key === 'ArrowUp' && field.id === 'new_comment_field' && field.value === '') {
			const lastOwnComment = select.all('.js-comment.current-user').pop();

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
