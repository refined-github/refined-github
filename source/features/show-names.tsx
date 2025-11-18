import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import batchedFunction from 'batched-function';
import getEmojiRegex from 'emoji-regex-xs';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {getLoggedInUser, isUsernameAlreadyFullName} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';
import {removeTextNodeContaining} from '../helpers/dom-utils.js';
import {usernameLinksSelector} from '../github-helpers/selectors.js';
import {expectToken} from '../github-helpers/github-token.js';
import attachElement from '../helpers/attach-element.js';

const emojiRegex = getEmojiRegex();

async function dropExtraCopy(link: HTMLAnchorElement): Promise<void> {
	// Drop 'commented' label to shorten the copy
	const commentedNode = link.parentNode!.nextSibling;
	if (link.closest('.timeline-comment-header') && commentedNode) {
		// "left a comment" appears in the main comment of reviews
		removeTextNodeContaining(commentedNode, /commented|left a comment/);
	}
}

function createElement(element: HTMLAnchorElement, fullName: string): JSX.Element {
	const nameElement = (
		<span className="color-fg-muted css-truncate d-inline-block rgh-show-names">
			{/* .css-truncate-target sets display: inline-block and confines bidi overrides #8191 */}
			(<span className="css-truncate-target" style={{maxWidth: '200px'}}>{fullName}</span>)
		</span>
	);

	const testId = element.getAttribute('data-testid');
	if (testId && ['issue-body-header-author', 'avatar-link'].includes(testId)) {
		nameElement.classList.add('ml-1');
	}

	return nameElement;
}

function appendName(element: HTMLAnchorElement, fullName: string): void {
	// If it's a regular comment author, add it outside <strong> otherwise it's something like "User added some commits"
	const {parentElement} = element;
	const insertionPoint = parentElement!.tagName === 'STRONG' ? parentElement! : element;

	// React might create a new label without removing the old one
	// https://github.com/refined-github/refined-github/issues/8478
	attachElement(insertionPoint, {after: () => createElement(element, fullName)});
}

async function updateLinks(found: HTMLAnchorElement[]): Promise<void> {
	const users = Map.groupBy(
		// Exclude nested items https://github.com/refined-github/refined-github/pull/8661
		found.filter(element => element.textContent.trim() === element.href.split('/').pop()),
		element => element.textContent.trim(),
	);
	const currentUser = getLoggedInUser()!;
	const currentUserElements = users.get(currentUser);
	if (currentUserElements) {
		for (const currentUserElement of currentUserElements) {
			// For `sticky-comment-header`. Use attribute because classes are altered by GitHub
			currentUserElement.closest('[data-testid="comment-header"]')?.setAttribute('data-rgh-viewer-did-author', '');
		}

		users.delete(currentUser);
	}

	users.delete('ghost'); // Consider using `github-reserved-names` if more exclusions are needed

	if (users.size === 0) {
		return;
	}

	const names = await api.v4(
		[...users.keys()].map(username =>
			api.escapeKey(username) + `: user(login: "${username}") {name}`,
		).join(','),
	);

	for (const [username, elements] of users) {
		const userKey = api.escapeKey(username);
		const {name: fullName} = names[userKey];

		// Could be `null` if not set
		if (!fullName) {
			continue;
		}

		const fullNameWithoutEmoji = fullName.replace(emojiRegex, '').trim();

		for (const element of elements) {
			if (isUsernameAlreadyFullName(username, fullNameWithoutEmoji)) {
				element.textContent = fullNameWithoutEmoji;
			} else {
				appendName(element, fullNameWithoutEmoji);
			}
		}
	}
}

const updateLink = batchedFunction(updateLinks, {delay: 200});

function updateDom(link: HTMLAnchorElement): void {
	// `dropExtraCopy` is async so that errors in this part don't break the entire feature
	void dropExtraCopy(link);

	updateLink(link);
}

async function init(signal: AbortSignal): Promise<void> {
	await expectToken();
	observe(usernameLinksSelector, updateDom, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isDashboard,
		pageDetect.hasComments,
	],
	init,
});

/*

Test URLs:

- issue: https://github.com/isaacs/github/issues/297
- PR with reviews: https://github.com/rust-lang/rfcs/pull/2544
- mannequins: https://togithub.com/python/cpython/issues/67591
- newsfeed: https://github.com

Special cases:

- RTL: https://github.com/refined-github/refined-github/issues/8191
- Bidi override case 1: https://togithub.com/FortAwesome/Font-Awesome/issues/2465
- Bidi override case 2: https://togithub.com/w3c/webdriver/issues/385#issuecomment-598407238
- With emoji: https://github.com/typescript-eslint/tsgolint/pull/2

*/
