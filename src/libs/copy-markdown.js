import toMarkdown from 'to-markdown';
import copyToClipboard from 'copy-text-to-clipboard';

export default event => {
	const selection = window.getSelection();
	const range = selection.getRangeAt(0);
	const container = range.commonAncestorContainer;
	const containerEl = container.closest ? container : container.parentNode;

	// Exclude pure code selections and selections across markdown elements:
	// https://github.com/sindresorhus/refined-github/issues/522#issuecomment-311271274
	if (containerEl.closest('pre') || containerEl.querySelector('.markdown-body')) {
		return;
	}

	event.stopImmediatePropagation();
	event.preventDefault();

	const holder = document.createElement('div');
	holder.append(range.cloneContents());
	const markdown = toMarkdown(holder.innerHTML, {gfm: true});

	copyToClipboard(markdown);
};
