import linkifyUrls from 'linkify-urls';
import linkifyIssues from 'linkify-issues';
import getTextNodes from './get-text-nodes';
import {getOwnerAndRepo} from './utils';

// If we are not in a repo, relative issue references won't make sense
// but `user`/`repo` need to be set to avoid breaking errors in `linkify-issues`
// https://github.com/sindresorhus/refined-github/issues/1305
const currentRepo = getOwnerAndRepo();

// Shared class necessary to avoid also shortening the links
export const linkifiedURLClass = 'rgh-linkified-code';

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

export default (
	fn: typeof linkifyIssues | typeof linkifyUrls,
	el: Node,
	nodeText?: string
): void => {
	const localOptions = nodeText ? {
		text: nodeText,
		...options
	} : options;

	for (const textNode of getTextNodes(el)) {
		if (fn === linkifyUrls && textNode.textContent!.length < 11) { // Shortest url: http://j.mp
			continue;
		}

		const linkified = fn(textNode.textContent!, localOptions);
		if (linkified.children.length > 0) { // Children are <a>
			if (fn === linkifyIssues) {
				// Enable native issue title fetch
				for (const link of (linkified.children as HTMLCollectionOf<HTMLAnchorElement>)) {
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
