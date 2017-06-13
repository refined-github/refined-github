import select from 'select-dom';
import linkifyUrls from 'linkify-urls';
import linkifyIssues from 'linkify-issues';
import {getOwnerAndRepo} from './page-detect';
import getTextNodes from './get-text-nodes';
import html from './domify';

const linkifiedURLClass = 'refined-github-linkified-code';
const attrs = {
	target: '_blank'
};

export default () => {
	const untouchedCode = select.all(`.blob-wrapper:not(.${linkifiedURLClass})`);

	// Don't linkify any already linkified code
	if (untouchedCode.length === 0) {
		return;
	}

	const {
		ownerName: user,
		repoName: repo
	} = getOwnerAndRepo();

	// Linkify full URLs
	for (const el of select.all('.blob-code-inner', untouchedCode)) {
		for (const textNode of getTextNodes(el)) {
			const linkified = linkifyUrls(textNode.textContent, {attrs});
			textNode.replaceWith(html(linkified));
		}
	}

	// Linkify issue refs in comments
	for (const el of select.all('.blob-code-inner span.pl-c', untouchedCode)) {
		for (const textNode of getTextNodes(el)) {
			const linkified = linkifyIssues(textNode.textContent, {user, repo, attrs});
			textNode.replaceWith(html(linkified));
		}
	}

	// Mark code block as touched
	untouchedCode.forEach(el => el.classList.add(linkifiedURLClass));
};
