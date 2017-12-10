import select from 'select-dom';
import delegate from 'delegate';

function indentInput(el, size = 4) {
	const selection = window.getSelection().toString();
	const {selectionStart, selectionEnd, value} = el;
	const linesCount = selection.match(/^|\n/g).length;
	const firstLineStart = value.lastIndexOf('\n', selectionStart) + 1;

	el.focus();

	if (linesCount > 1) {
		// Select full first line to replace everything at once
		el.setSelectionRange(firstLineStart, selectionEnd);

		const newSelection = window.getSelection().toString();
		const indentedText = newSelection.replace(
			/^|\n/g, // Match all line starts
			'$&' + ' '.repeat(size)
		);

		// Replace newSelection with indentedText
		document.execCommand('insertText', false, indentedText);

		// Restore selection position
		el.setSelectionRange(
			selectionStart + size,
			selectionEnd + (size * linesCount)
		);
	} else {
		const indentSize = (size - ((selectionEnd - firstLineStart) % size)) || size;
		document.execCommand('insertText', false, ' '.repeat(indentSize));
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
			const cancelButton = select('.js-hide-inline-comment-form', field.form);

			if (field.value !== '' && cancelButton) {
				cancelButton.click();
			}
		}
	});
}
