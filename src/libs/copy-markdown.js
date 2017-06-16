import toMarkdown from 'to-markdown';
import copyToClipboard from 'copy-text-to-clipboard';

export default event => {
	const selection = window.getSelection();
	const range = selection.getRangeAt(0);
	const container = range.commonAncestorContainer;
	const containerEl = container.closest ? container : container.parentNode;

	if (containerEl.closest('pre')) {
		return;
	}

	event.stopImmediatePropagation();

	const holder = document.createElement('div');
	holder.append(range.cloneContents());
	const markdown = toMarkdown(holder.innerHTML, {gfm: true});

	copyToClipboard(markdown);
};
