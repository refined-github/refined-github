import {$, $closest} from 'select-dom';

export default function linkifyLineNumber(lineNumberCell: HTMLTableCellElement): void {
	const {lineNumber} = lineNumberCell.dataset;
	if (!lineNumber) {
		throw new Error('Expected the cell to have the `data-line-number` attribute');
	}

	const fileLink = $([
		'a[href*="#L"]', // Regular blob links
		'a[href*="#diff-"]', // PR diff links
	], $closest(['.Box', '.review-thread-component'], lineNumberCell));
	const fileUrl = new URL(fileLink.getAttribute('href') ?? fileLink.href, location.origin);

	const lineUrl = fileUrl.hash.startsWith('#diff-')
		? fileUrl.pathname + fileUrl.hash + `R${lineNumber}`
		: fileUrl.pathname + `#L${lineNumber}`;

	const linkified = lineNumberCell.ownerDocument.createElement('a');
	linkified.href = lineUrl;
	linkified.classList.add('d-block', 'no-underline', 'Link--onHover');
	linkified.append(...lineNumberCell.childNodes);
	lineNumberCell.append(linkified);
}
