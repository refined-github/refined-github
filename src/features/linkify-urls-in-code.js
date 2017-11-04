import select from 'select-dom';
import linkifyUrls from 'linkify-urls';
import linkifyIssues from 'linkify-issues';
import {getOwnerAndRepo} from '../libs/page-detect';
import getTextNodes from '../libs/get-text-nodes';

const linkifiedURLClass = 'refined-github-linkified-code';
const {
	ownerName,
	repoName
} = getOwnerAndRepo();

const options = {
	user: ownerName,
	repo: repoName,
	type: 'dom',
	baseUrl: '',
	attrs: {
		target: '_blank'
	}
};

export const editTextNodes = (fn, el) => {
	// Spread required because the elements will change and the TreeWalker will break
	for (const textNode of [...getTextNodes(el)]) {
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
	const wrappers = select.all(`.highlight:not(.${linkifiedURLClass})`);

	// Don't linkify any already linkified code
	if (wrappers.length === 0) {
		return;
	}

	// Linkify full URLs
	// `.blob-code-inner` in diffs
	// `pre` in GitHub comments
	for (const el of select.all('.blob-code-inner, pre', wrappers)) {
		editTextNodes(linkifyUrls, el);
	}

	// Linkify issue refs in comments
	for (const el of select.all('span.pl-c', wrappers)) {
		editTextNodes(linkifyIssues, el);
	}

	// Mark code block as touched
	for (const el of wrappers) {
		el.classList.add(linkifiedURLClass);
	}
};
