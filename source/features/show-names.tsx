import './show-names.css';

import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import batchedFunction from 'batched-function';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {getUsername, isUsernameAlreadyFullName} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';
import {removeTextNodeContaining} from '../helpers/dom-utils.js';
import {usernameLinksSelector} from '../github-helpers/selectors.js';
import {expectToken} from '../github-helpers/github-token.js';

async function dropExtraCopy(link: HTMLAnchorElement): Promise<void> {
	// Drop 'commented' label to shorten the copy
	const commentedNode = link.parentNode!.nextSibling;
	if (link.closest('.timeline-comment-header') && commentedNode) {
		// "left a comment" appears in the main comment of reviews
		removeTextNodeContaining(commentedNode, /commented|left a comment/);
	}
}

function appendName(element: HTMLAnchorElement, fullName: string): void {
	// If it's a regular comment author, add it outside <strong> otherwise it's something like "User added some commits"
	const {parentElement} = element;
	parentElement!.classList.add('d-inline-block');
	const insertionPoint = parentElement!.tagName === 'STRONG' ? parentElement! : element;
	insertionPoint.after(
		' ',
		<span className="color-fg-muted css-truncate d-inline-block">
			(<bdo className="css-truncate-target" style={{maxWidth: '200px'}}>{fullName}</bdo>)
		</span>,
		' ',
	);
}

async function updateLinks(found: HTMLAnchorElement[]): Promise<void> {
	const users = Map.groupBy(found, element => element.textContent.trim());
	users.delete(getUsername()!);
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

		for (const element of elements) {
			if (isUsernameAlreadyFullName(username, fullName)) {
				element.textContent = fullName;
			} else {
				appendName(element, fullName);
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
	document.body.classList.add('rgh-show-names');
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

*/
