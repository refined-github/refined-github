export default function (element: HTMLTextAreaElement) {
	const selection = window.getSelection().toString();
	const {selectionStart, selectionEnd, value} = element;
	const linesCount = selection.match(/^|\n/g).length;

	if (linesCount > 1) {
		// Select full first line to replace everything at once
		const firstLineStart = value.lastIndexOf('\n', selectionStart) + 1;
		element.setSelectionRange(firstLineStart, selectionEnd);

		const newSelection = window.getSelection().toString();
		const indentedText = newSelection.replace(
			/^|\n/g, // Match all line starts
			'$&\t'
		);

		// Replace newSelection with indentedText
		document.execCommand('insertText', false, indentedText);

		// Restore selection position, including the indentation
		element.setSelectionRange(
			selectionStart + 1,
			selectionEnd + linesCount
		);
	} else {
		document.execCommand('insertText', false, '\t');
	}
}
