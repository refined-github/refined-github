import select from 'select-dom';
import linkifyUrls from 'linkify-urls';
import linkifyIssues from 'linkify-issues';
import {getOwnerAndRepo} from './page-detect';
import getTextNodes from './get-text-nodes';

const linkifiedURLClass = 'refined-github-linkified-code';
const {
	ownerName,
	repoName
} = getOwnerAndRepo();

const options = {
	user: ownerName,
	repo: repoName,
	type: 'dom',
	attrs: {
		target: '_blank'
	}
};

export const editTextNodes = (fn, el) => {
	for (const textNode of getTextNodes(el)) {
		if (fn === linkifyUrls && textNode.textContent.length < 11) { // Shortest url: http://j.mp
			continue;
		}
		const linkified = fn(textNode.textContent, options);
		if (linkified.children.length > 0) { // Children are <a>
			textNode.replaceWith(linkified);
		}
	}
};

export default () => {
	const untouchedCode = select.all(`.blob-wrapper:not(.${linkifiedURLClass})`);

	// Don't linkify any already linkified code
	if (untouchedCode.length === 0) {
		return;
	}

	// Linkify full URLs
	for (const el of select.all('.blob-code-inner', untouchedCode)) {
		editTextNodes(linkifyUrls, el);
	}

	// Linkify issue refs in comments
	for (const el of select.all('.blob-code-inner span.pl-c', untouchedCode)) {
		editTextNodes(linkifyIssues, el);
	}

	// Mark code block as touched
	for (const el of untouchedCode) {
		el.classList.add(linkifiedURLClass);
	}
};
