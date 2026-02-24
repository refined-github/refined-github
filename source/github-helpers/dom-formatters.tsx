import React from 'dom-chef';
import {elementExists} from 'select-dom';
import {$$} from 'select-dom/strict.js';
import zipTextNodes from 'zip-text-nodes';
import {applyToLink} from 'shorten-repo-url';
import {linkifyUrlsToDom} from 'linkify-urls';
import {linkifyIssuesToDom, type Options as LinkifyIssuesOptions} from 'linkify-issues';

import getTextNodes from '../helpers/get-text-nodes.js';
import parseBackticksCore from './parse-backticks.js';
import {buildRepoURL} from './index.js';

// Shared class necessary to avoid also shortening the links
export const linkifiedURLClass = 'rgh-linkified-code';
const linkifiedURLSelector = '.rgh-linkified-code';

export const codeElementsSelector = [
	// Sometimes formatted diffs are loaded later and discard our formatting #5870
	'.blob-code-inner:not(deferred-diff-lines.awaiting-highlight *)', // Code lines
	':is(.snippet-clipboard-content, .highlight) > pre.notranslate', // Code blocks in comments. May be wrapped twice
	'.comment-body code:not(a code, pre code)', // Inline code in comments
	'.diff-text-inner',
	'.react-file-line',
];

export function shortenLink(link: HTMLAnchorElement): void {
	// Exclude the link if the closest element found is not `.markdown-body`
	// This avoids shortening links in code and code suggestions, but still shortens them in review comments
	// https://github.com/refined-github/refined-github/pull/4759#discussion_r702460890
	if (link.closest(String([...codeElementsSelector, '.markdown-body']))?.classList.contains('markdown-body')) {
		applyToLink(link, location.href);
	}
}

// https://github.com/refined-github/refined-github/issues/6336#issuecomment-1498645639
export function createInvisibleAnchors(element: HTMLElement): void {
	// TODO: bump min firefox version to 147 and safari to 26 in 2027
	if (!CSS.supports('anchor-name: --test')) {
		return;
	}

	// Safety measure
	// DOM changes made by this function is unnecessary if the textarea doesn't exist and can cause issues
	if (!elementExists('#read-only-cursor-text-area')) {
		return;
	}

	const container = element.closest('.react-code-file-contents')!.parentElement!;

	const codeLine = element.closest('[id]');
	if (!codeLine) {
		throw new Error('Could not find parent code line');
	}

	const links = $$('a', codeLine);
	for (const [index, link] of links.entries()) {
		const clonedLink = link.cloneNode(true);
		clonedLink.className += ` ${codeLine.className} rgh-invisible-anchored-link`;
		const anchor = `--rgh-${codeLine.id}-${index}`;
		// @ts-expect-error -- Not widely available yet
		link.style.anchorName = anchor;
		// @ts-expect-error -- Not widely available yet
		clonedLink.style.positionAnchor = anchor;
		container.prepend(clonedLink);
	}

	// Hide overflow
	container.style.position = 'relative';
}

export function linkifyIssues(
	currentRepo: {owner?: string; name?: string},
	element: HTMLElement,
	options: Partial<LinkifyIssuesOptions> = {},
): void {
	const linkified = linkifyIssuesToDom(element.textContent, {
		user: currentRepo.owner ?? '/',
		repository: currentRepo.name ?? '/',
		baseUrl: '',
		...options,
		attributes: {
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
		link.setAttribute('class', 'issue-link js-issue-link');
		link.dataset.errorText = 'Failed to load title';
		link.dataset.permissionText = 'Title is private';
		link.dataset.url = link.href;
		link.dataset.id = `rgh-issue-${issue!}`;
		link.dataset.hovercardType = 'issue';
		link.dataset.hovercardUrl = `${link.pathname}/hovercard`;
	}

	zipTextNodes(element, linkified);
	createInvisibleAnchors(element);
}

export function linkifyURLs(element: HTMLElement): void {
	if (element.textContent.length < 15) { // Must be long enough for a URL
		return;
	}

	if (elementExists(linkifiedURLSelector, element)) {
		console.warn('Links already exist', element);
		throw new Error('Links already exist');
	}

	const linkified = linkifyUrlsToDom(element.textContent, {
		attributes: {
			rel: 'noreferrer noopener',
			class: linkifiedURLClass, // Necessary to avoid also shortening the links
		},
	});

	if (linkified.children.length === 0) { // Children are <a>
		return;
	}

	zipTextNodes(element, linkified);
	createInvisibleAnchors(element);
}

export function parseBackticks(element: Element): void {
	for (const node of getTextNodes(element)) {
		const fragment = parseBackticksCore(node.textContent);

		if (fragment.children.length > 0) {
			node.replaceWith(fragment);
		}
	}
}

export function linkifyCommit(sha: string): JSX.Element {
	// Data attributes copied from the commit in https://github.com/refined-github/github-url-detection/releases/tag/v7.1.2
	return (
		<code>
			<a
				className="Link--secondary"
				href={buildRepoURL('commit', sha)}
				data-hovercard-type="commit"
				data-hovercard-url={buildRepoURL('commit', sha, 'hovercard')}
			>
				{sha.slice(0, 7)}
			</a>
		</code>
	);
}

export function parseRenderedText(element: Element, filter?: NodeFilter): string {
	const walker = document.createTreeWalker(element, NodeFilter.SHOW_ALL, filter);

	let parsedText = '';
	// eslint-disable-next-line @typescript-eslint/no-restricted-types
	let currentNode = walker.currentNode as Node | null;

	while (currentNode) {
		if (currentNode.nodeName === 'CODE') {
			const {textContent} = currentNode;
			// Restore backticks that GitHub loses when rendering them
			parsedText += textContent ? `\`${textContent}\`` : '';
			currentNode = walker.nextSibling();
			continue;
		}

		if (currentNode.nodeType === Node.TEXT_NODE) {
			parsedText += currentNode.nodeValue;
		}

		currentNode = walker.nextNode();
	}

	return parsedText.trim();
}
