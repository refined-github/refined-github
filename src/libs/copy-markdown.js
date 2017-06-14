import toMarkdown from 'to-markdown';
import copyToClipboard from 'copy-text-to-clipboard';

const selectionHtml = selection => {
	const documentFragment = selection.getRangeAt(0).cloneContents();
	const tempElement = document.createElement('div');
	tempElement.append(documentFragment);
	document.body.appendChild(tempElement);

	const html = tempElement.innerHTML;

	document.body.removeChild(tempElement);

	return html;
};

const setSelection = (selection, range) => {
	selection.removeAllRanges();
	selection.addRange(range);
};

export default event => {
	const selection = window.getSelection();

	event.stopImmediatePropagation();

	const originalSelection = selection.getRangeAt(0);

	const html = selectionHtml(selection);
	const markdown = toMarkdown(html, {gfm: true});

	copyToClipboard(markdown);

	window.setTimeout(() => setSelection(selection, originalSelection), 10);
};
