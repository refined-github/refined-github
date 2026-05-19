import {$closest, $optional} from 'select-dom';

function getLinkHref(link: HTMLAnchorElement): string {
	const href = link.getAttribute('href')?.trim();
	if (href) {
		return href;
	}

	return link.href;
}

export default function linkifyLineNumber(lineNumberCell: HTMLTableCellElement): void {
	const {lineNumber} = lineNumberCell.dataset;
	if (!lineNumber) {
		throw new Error('Expected the cell to have the `data-line-number` attribute');
	}

	const fileLink = $optional([
		'a[href*="#L"]', // Regular blob links
		'a[href*="#diff-"]', // PR diff links
	], $closest(['.Box', '.review-thread-component'], lineNumberCell));
	if (!fileLink) {
		throw new Error('Could not find a file permalink in the surrounding diff container');
	}

	const fileUrl = new URL(getLinkHref(fileLink), location.origin);

	const lineUrl = fileUrl.hash.startsWith('#diff-')
		? fileUrl.pathname + fileUrl.hash + `R${lineNumber}`
		: fileUrl.pathname + `#L${lineNumber}`;

	const linkElement = lineNumberCell.ownerDocument.createElement('a');
	linkElement.href = lineUrl;
	linkElement.classList.add('d-block', 'no-underline', 'Link--onHover');
	linkElement.append(...lineNumberCell.childNodes);
	lineNumberCell.append(linkElement);
}
