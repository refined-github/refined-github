import select from 'select-dom';
import linkifyUrls from 'linkify-urls';
import linkifyIssues from 'linkify-issues';
import {getOwnerAndRepo} from './page-detect';
import getTextNodes from './get-text-nodes';
import html from './domify';

// Necessary because textNodes don't have .innerHTML
const getInnerHTML = textNode => {
	const div = document.createElement('div');
	div.textContent = textNode.textContent;
	return div.innerHTML;
};

const linkifiedURLClass = 'refined-github-linkified-code';
const {
	ownerName,
	repoName
} = getOwnerAndRepo();

const options = {
	user: ownerName,
	repo: repoName,
	attrs: {
		target: '_blank'
	}
};

export const editTextNodes = (fn, el) => {
	if (!el) {
		return;
	}
	for (const textNode of getTextNodes(el)) {
		if (textNode.textContent.length < 11) { // Shortest url: http://j.mp
			continue;
		}
		const textHTML = getInnerHTML(textNode);
		const linkified = fn(textHTML, options);
		if (linkified !== textHTML) {
			textNode.replaceWith(html(linkified));
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
