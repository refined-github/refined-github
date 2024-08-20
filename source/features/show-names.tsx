import './show-names.css';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import batchedFunction from 'batched-function';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {getUsername, isUsernameAlreadyFullName} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';
import {removeTextNodeContaining} from '../helpers/dom-utils.js';

function dropExtraCopy(element: HTMLAnchorElement): void {
	// Drop 'commented' label to shorten the copy
	const commentedNode = element.parentNode!.nextSibling;
	if (element.closest('.timeline-comment-header') && commentedNode) {
		// "left a comment" appears in the main comment of reviews
		removeTextNodeContaining(commentedNode, /commented|left a comment/);
	}
}

// The selector observer calls this function several times, but we want to batch them into a single GraphQL API call
async function updateLink(batchedUsernameElements: HTMLAnchorElement[]): Promise<void> {
	const myUsername = getUsername();
	batchedUsernameElements = batchedUsernameElements.filter((element) => {
		const name = element.textContent;
		if (!name) {
			console.warn('Error', element)
			throw new Error('Failed to get textContent in the element');
		}
		return name !== myUsername && name !== 'ghost'
	});
	const usernames = new Set(batchedUsernameElements.map(element => element.textContent));

	if (usernames.size === 0) {
		return;
	}

	const names = await api.v4(
		[...usernames].map(user =>
			api.escapeKey(user) + `: user(login: "${user}") {name}`,
		).join(','),
	);

	for (const usernameElement of batchedUsernameElements) {
		const username = usernameElement.textContent;
		const userKey = api.escapeKey(username);
		const {name} = names[userKey];

		// Could be `null` if not set
		if (!name) {
			continue;
		}

		if (isUsernameAlreadyFullName(username, name)) {
			usernameElement.textContent = name;
			continue;
		}

		// If it's a regular comment author, add it outside <strong> otherwise it's something like "User added some commits"
		const {parentElement} = usernameElement;
		const insertionPoint = parentElement!.tagName === 'STRONG' ? parentElement! : usernameElement;

		// This change is ideal but should not break the feature if it fails
		// And it should be done before inserting the name
		try {
			dropExtraCopy(usernameElement);
		} catch (error) {
			features.log.error(import.meta.url, error);
		}

		insertionPoint.after(
			' ',
			<span className="color-fg-muted css-truncate d-inline-block">
				(<bdo className="css-truncate-target" style={{maxWidth: '200px'}}>{name}</bdo>)
			</span>,
			' ',
		);
	}
}

const usernameLinksSelector = [
	// `a` selector needed to skip commits by non-GitHub users
	// # targets mannequins #6504
	`:is(
		.js-discussion,
		.inline-comments
	) a.author:not(
		[href="#"],
		[href*="/apps/"],
		[href*="/marketplace/"],
		[data-hovercard-type="organization"],
		[show_full_name="true"]
	)`,
	// GHE sometimes shows the full name already:
	// https://github.com/refined-github/refined-github/issues/7232#issuecomment-1910803157

	// On dashboard
	// `.Link--primary` excludes avatars
	// [aria-label="card content"] excludes links in cards #6530 #6915
	'#dashboard a.Link--primary[data-hovercard-type="user"]:not([aria-label="card content"] *)',
] as const;

function init(signal: AbortSignal): void {
	document.body.classList.add('rgh-show-names');
	observe(usernameLinksSelector, batchedFunction(updateLink, {delay: 100}), {signal});
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
