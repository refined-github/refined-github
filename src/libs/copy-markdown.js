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
	const range = selection.getRangeAt(0);
	const container = range.commonAncestorContainer;
	const containerEl = container.closest ? container : container.parentNode;

	if (containerEl.closest('pre')) {
		return;
	}

	event.stopImmediatePropagation();

	const html = selectionHtml(selection);
	const markdown = toMarkdown(html, {gfm: true});

	copyToClipboard(markdown);

	window.setTimeout(() => setSelection(selection, range), 10);
};
