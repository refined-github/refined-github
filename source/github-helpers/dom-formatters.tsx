import React from 'dom-chef';
import {linkifyIssuesToDom, type Options as LinkifyIssuesOptions} from 'linkify-issues';
import {linkifyUrlsToDom} from 'linkify-urls';
import {$$optional, closestElementOptional, elementExists} from 'select-dom';
import {applyToLink} from 'shorten-repo-url';
import zipTextNodes from 'zip-text-nodes';

import getTextNodes from '../helpers/get-text-nodes.js';
import {buildRepoUrl, getConversationNumber} from './index.js';
import parseBackticksCore from './parse-backticks.js';

// Shared class necessary to avoid also shortening the links
export const linkifiedUrlClass = 'rgh-linkified-code';
const linkifiedUrlSelector = '.rgh-linkified-code';
const clickableCodeLinkClass = 'rgh-clickable-code-link';
let codeLinkAnchorIndex = 0;

export const codeElementsSelector = [
	// Sometimes formatted diffs are loaded later and discard our formatting #5870
	'.blob-code-inner:not(deferred-diff-lines.awaiting-highlight *)', // Code lines
	':is(.snippet-clipboard-content, .highlight) > pre.notranslate', // Code blocks in comments. May be wrapped twice
	'.markdown-body code:not(a code, pre code)', // Inline code in comments
	'.diff-text-inner',
	'.react-file-line',
];

export function shortenLink(link: HTMLAnchorElement): void {
	// Exclude the link if the closest element found is not `.markdown-body`
	// This avoids shortening links in code and code suggestions, but still shortens them in review comments
	// https://github.com/refined-github/refined-github/pull/4759#discussion_r702460890
	if (!closestElementOptional([...codeElementsSelector, '.markdown-body'], link)?.classList.contains('markdown-body')) {
		return;
	}

	applyToLink(link, location.href);

	// Customize same-thread links. Already handled by GitHub, but badly
	// https://github.com/refined-github/refined-github/issues/6057
	switch (link.textContent) {
		case `#${getConversationNumber()} (comment)`: {
			link.textContent = '(earlier comment)';
			break;
		}

		case `#${getConversationNumber()} (review)`: {
			link.textContent = '(earlier review)';
			break;
		}

		default:
	}
}

// GitHub puts an invisible textarea over code when line wrapping is disabled,
// which prevents links inside the inert syntax-highlighted line from receiving clicks.
// Keep the clickable copies inside the line's own React wrapper so virtualization
// and navigation remove them together with the line.
export function makeCodeLinksClickable(element: HTMLElement): void {
	if (!CSS.supports('anchor-name', '--test')) {
		return;
	}

	const codeLine = closestElementOptional('.react-file-line', element);
	if (!codeLine) {
		return;
	}

	const overlayContainer = codeLine.parentElement;
	if (!overlayContainer || !closestElementOptional('.react-code-text', overlayContainer)) {
		return;
	}

	for (const oldOverlay of $$optional(`:scope > .${clickableCodeLinkClass}`, overlayContainer)) {
		oldOverlay.remove();
	}

	for (const link of $$optional('a', codeLine)) {
		const anchorName = `--rgh-code-link-${codeLinkAnchorIndex++}`;
		const clickableLink = link.cloneNode(true);
		link.style.setProperty('anchor-name', anchorName);
		clickableLink.style.removeProperty('anchor-name');
		clickableLink.style.setProperty('position-anchor', anchorName);
		clickableLink.classList.add(clickableCodeLinkClass);
		overlayContainer.append(clickableLink);
	}
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
			class: linkifiedUrlClass, // Necessary to avoid also shortening the links
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
}

export function linkifyUrls(element: HTMLElement): void {
	if (element.textContent.length < 15) { // Must be long enough for a URL
		return;
	}

	if (elementExists(linkifiedUrlSelector, element)) {
		console.warn('Links already exist', element);
		throw new Error('Links already exist');
	}

	const linkified = linkifyUrlsToDom(element.textContent, {
		attributes: {
			rel: 'noreferrer noopener',
			class: linkifiedUrlClass, // Necessary to avoid also shortening the links
		},
	});

	if (linkified.children.length === 0) { // Children are <a>
		return;
	}

	zipTextNodes(element, linkified);
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
				href={buildRepoUrl('commit', sha)}
				data-hovercard-type="commit"
				data-hovercard-url={buildRepoUrl('commit', sha, 'hovercard')}
			>
				{sha.slice(0, 7)}
			</a>
		</code>
	);
}
