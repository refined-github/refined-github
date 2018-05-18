/* Lasciate ogne speranza, voi ch'entrate. */
import select from 'select-dom';
import observeEl from '../libs/simplified-element-observer';

function removeDiffSigns() {
	for (const line of select.all('.diff-table > tbody > tr:not(.refined-github-diff-signs)')) {
		line.classList.add('refined-github-diff-signs');
		for (const code of select.all('.blob-code-inner', line)) {
			// Drop -, + or space
			code.firstChild.textContent = code.firstChild.textContent.slice(1);

			// If a line is empty, the next line will collapse
			if (code.textContent.length === 0) {
				code.prepend(' ');
			}
		}
	}
}

function removeSelectableWhiteSpaceFromDiffs() {
	for (const commentBtn of select.all('.add-line-comment')) {
		for (const node of commentBtn.childNodes) {
			if (node.nodeType === Node.TEXT_NODE) {
				node.remove();
			}
		}
	}
}

function removeDiffSignsAndWatchExpansions() {
	removeSelectableWhiteSpaceFromDiffs();
	removeDiffSigns();
	for (const file of select.all('.diff-table:not(.rgh-watching-lines)')) {
		if (select.exists('.diff-expander', file)) {
			file.classList.add('rgh-watching-lines');
			observeEl(file.tBodies[0], removeDiffSigns);
		}
	}
}

export default function () {
	const diffElements = select('.js-discussion, #files');
	if (diffElements) {
		observeEl(diffElements, removeDiffSignsAndWatchExpansions, {childList: true, subtree: true});
	}
}
