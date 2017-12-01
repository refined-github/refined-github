import select from 'select-dom';
import delegate from '../libs/smart-delegate';

function indentInput(el, size = 4) {
	const selection = window.getSelection().toString();
	const {selectionStart, selectionEnd, value} = el;
	const isMultiLine = /\n/.test(selection);
	const firstLineStart = value.lastIndexOf('\n', selectionStart) + 1;

	el.focus();

	if (isMultiLine) {
		const selectedLines = value.substring(firstLineStart, selectionEnd);

		// Find the start index of each line
		const indexes = selectedLines.split('\n').map(line => line.length);
		indexes.unshift(firstLineStart);
		indexes.pop();

		// `indexes` contains lengths. Update them to point to each line start index
		for (let i = 1; i < indexes.length; i++) {
			indexes[i] += indexes[i - 1] + 1;
		}

		for (let i = indexes.length - 1; i >= 0; i--) {
			el.setSelectionRange(indexes[i], indexes[i]);
			document.execCommand('insertText', false, ' '.repeat(size));
		}

		// Restore selection position
		el.setSelectionRange(
			selectionStart + size,
			selectionEnd + (size * indexes.length)
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
			return false;
		} else if (event.key === 'Enter' && event.shiftKey) {
			const singleCommentButton = select('.review-simple-reply-button', field.form);

			if (singleCommentButton) {
				singleCommentButton.click();
				return false;
			}
		} else if (event.key === 'Escape') {
			const cancelButton = select('.js-hide-inline-comment-form', field.form);

			if (field.value !== '' && cancelButton) {
				cancelButton.click();
				return false;
			}
		}
	});
}
