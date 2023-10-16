import './show-names.css';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import batchedFunction from 'batched-function';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {getUsername, compareNames} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';
import {removeTextNodeContaining} from '../helpers/dom-utils.js';

// The selector observer calls this function several times, but we want to batch them into a single GraphQL API call
async function updateLink(batchedUsernameElements: HTMLAnchorElement[]): Promise<void> {
	// TODO: Split up this function, it does too much
	const usernames = new Set<string>();
	const myUsername = getUsername();
	for (const element of new Set(batchedUsernameElements)) {
		const username = element.textContent;

		if (username && username !== myUsername && username !== 'ghost') {
			usernames.add(element.textContent);
		}

		// Drop 'commented' label to shorten the copy
		const commentedNode = element.parentNode!.nextSibling;
		if (element.closest('.timeline-comment-header') && commentedNode) {
			// "left a comment" appears in the main comment of reviews
			removeTextNodeContaining(commentedNode, /commented|left a comment/);
		}
	}

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

		// For the currently logged in user, `names[userKey]` would not be present
		const {name} = names[userKey] ?? {};
		if (!name) {
			continue;
		}

		// If it's a regular comment author, add it outside <strong> otherwise it's something like "User added some commits"
		if (compareNames(username, name)) {
			usernameElement.textContent = name;
			continue;
		}

		const {parentElement} = usernameElement;
		const insertionPoint = parentElement!.tagName === 'STRONG' ? parentElement! : usernameElement;
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
		[data-hovercard-type="organization"]
	)`,

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
- pr with reviews: https://github.com/rust-lang/rfcs/pull/2544
- mannequins: https://togithub.com/python/cpython/issues/67591
- newsfeed: https://github.com

*/
