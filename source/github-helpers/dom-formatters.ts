import zipTextNodes from 'zip-text-nodes';
import linkifyURLsCore from 'linkify-urls';
import linkifyIssuesCore from 'linkify-issues';

import {getRepo} from '.';
import getTextNodes from '../helpers/get-text-nodes.js';
import parseBackticksCore from './parse-backticks.js';

// Shared class necessary to avoid also shortening the links
export const linkifiedURLClass = 'rgh-linkified-code';

// If we are not in a repo, relative issue references won't make sense but `user`/`repo` need to be set to avoid breaking errors in `linkify-issues`
// https://github.com/refined-github/refined-github/issues/1305
const currentRepo = getRepo()!;

export function linkifyIssues(
	element: Element,
	options: Partial<linkifyIssuesCore.TypeDomOptions> = {},
): void {
	const linkified = linkifyIssuesCore(element.textContent!, {
		user: currentRepo.owner ?? '/',
		repository: currentRepo.name ?? '/',
		type: 'dom',
		baseUrl: '',
		...options,
		attributes: {
			rel: 'noreferrer noopener',
			class: linkifiedURLClass, // Necessary to avoid also shortening the links
			...options.attributes,
		},
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
		link.dataset.id = `rgh-issue-${issue!}`;
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
			class: linkifiedURLClass, // Necessary to avoid also shortening the links
		},
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
