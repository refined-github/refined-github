import select from 'select-dom';
import linkifyUrls from 'linkify-urls';
import linkifyIssues from 'linkify-issues';
import {getOwnerAndRepo} from '../libs/page-detect';
import getTextNodes from '../libs/get-text-nodes';

// Shared class necessary to avoid also shortening the links
export const linkifiedURLClass = 'rgh-linkified-code';

// If we are not in a repo, relative issue references won't make sense
// but `user`/`repo` need to be set to avoid breaking errors in `linkify-issues`
// https://github.com/sindresorhus/refined-github/issues/1305
const currentRepo = getOwnerAndRepo();
const options = {
	user: currentRepo.ownerName || '/',
	repo: currentRepo.repoName || '/',
	type: 'dom',
	baseUrl: '',
	attributes: {
		rel: 'noreferrer noopener',
		class: linkifiedURLClass // Necessary to avoid also shortening the links
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
			if (fn === linkifyIssues) {
				// Enable native issue title fetch
				for (const link of linkified.children) {
					const issue = link.href.split('/').pop();
					link.setAttribute('class', 'issue-link js-issue-link tooltipped tooltipped-ne');
					link.setAttribute('data-error-text', 'Failed to load issue title');
					link.setAttribute('data-permission-text', 'Issue title is private');
					link.setAttribute('data-url', link.href);
					link.setAttribute('data-id', `rgh-issue-${issue}`);
				}
			}
			textNode.replaceWith(linkified);
		}
	}
};

export default () => {
	const wrappers = select.all(`
		.blob-wrapper:not(.${linkifiedURLClass}),
		.comment-body:not(.${linkifiedURLClass})
	`);

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
