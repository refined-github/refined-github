import toMarkdown from 'to-markdown';
import copyToClipboard from 'copy-text-to-clipboard';

const unwrapContent = content => content;

const converters = [
	// Drop unnecessary elements
	// <g-emoji> is GH's emoji wrapper
	// input and .handle appear in "- [ ] lists", let's not copy tasks
	{
		filter: node => node.matches('g-emoji,.handle,input.task-list-item-checkbox'),
		replacement: unwrapContent
	},

	// Unwrap images
	{
		filter: node => node.tagName === 'A' && // It's a link
			node.childNodes.length === 1 && // It has one child
			node.firstChild.tagName === 'IMG' && // Its child is an image
			node.firstChild.src === node.href, // It links to its own image
		replacement: unwrapContent
	},

	// Keep <img> if it's customized
	{
		filter: node => node.matches('img[width],img[height],img[align]'),
		replacement: (content, element) => element.outerHTML
	}
];

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

	const markdown = toMarkdown(holder.innerHTML, {
		converters,
		gfm: true
	});

	copyToClipboard(markdown);
};
