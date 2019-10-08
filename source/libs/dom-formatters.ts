import zipTextNodes from 'zip-text-nodes';
import linkifyURLsCore from 'linkify-urls';
import linkifyIssuesCore from 'linkify-issues';
import getTextNodes from './get-text-nodes';
import {getOwnerAndRepo} from './utils';
import parseBackticksCore from './parse-backticks';

// Shared class necessary to avoid also shortening the links
export const linkifiedURLClass = 'rgh-linkified-code';

// If we are not in a repo, relative issue references won't make sense
// but `user`/`repo` need to be set to avoid breaking errors in `linkify-issues`
// https://github.com/sindresorhus/refined-github/issues/1305
const currentRepo = getOwnerAndRepo();

export function linkifyIssues(element: Element): void {
	const linkified = linkifyIssuesCore(element.textContent!, {
		user: currentRepo.ownerName || '/',
		repository: currentRepo.repoName || '/',
		type: 'dom',
		baseUrl: '',
		attributes: {
			rel: 'noreferrer noopener',
			class: linkifiedURLClass // Necessary to avoid also shortening the links
		}
	});
	if (linkified.children.length === 0) { // Children are <a>
		return;
	}

	// Enable native issue title fetch
	for (const link of linkified.children as HTMLCollectionOf<HTMLAnchorElement>) {
		const issue = link.href.split('/').pop();
		link.setAttribute('class', 'issue-link js-issue-link tooltipped tooltipped-ne');
		link.dataset.errorText = 'Failed to load issue title';
		link.dataset.permissionText = 'Issue title is private';
		link.dataset.url = link.href;
		link.dataset.id = `rgh-issue-${issue}`;
	}

	zipTextNodes(element, linkified);
}

export function linkifyURLs(element: Element): void {
	if (element.textContent!.length < 15) { // Must be long enough for a URL
		return;
	}

	const linkified = linkifyURLsCore(element.textContent!, {
		type: 'dom' as const,
		attributes: {
			rel: 'noreferrer noopener',
			class: linkifiedURLClass // Necessary to avoid also shortening the links
		}
	});

	if (linkified.children.length === 0) { // Children are <a>
		return;
	}

	zipTextNodes(element, linkified);
}

export function parseBackticks(element: Element): void {
	for (const node of getTextNodes(element)) {
		const fragment = parseBackticksCore(node.textContent!);

		if (fragment.children.length > 0) {
			node.replaceWith(fragment);
		}
	}
}
