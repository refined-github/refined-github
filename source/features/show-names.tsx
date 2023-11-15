import './show-names.css';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import batchedFunction from 'batched-function';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {getUsername, isUsernameAlreadyFullName} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';
import {removeTextNodeContaining} from '../helpers/dom-utils.js';

// Drop 'commented' label to shorten the copy
function dropExtraCopy(extraCopyNodes: ChildNode[]): void {
	for (const commentedNode of extraCopyNodes) {
		if (commentedNode.parentElement!.closest('.timeline-comment-header')) {
			// "left a comment" appears in the main comment of reviews
			removeTextNodeContaining(commentedNode, /commented|left a comment/);
		}
	}
}

// The selector observer calls this function several times, but we want to batch them into a single GraphQL API call
async function updateLink(batchedUsernameElements: HTMLAnchorElement[]): Promise<void> {
	const myUsername = getUsername();
	batchedUsernameElements = batchedUsernameElements.filter(({textContent: name}) => name !== myUsername && name !== 'ghost');
	const usernames = new Set(batchedUsernameElements.map(element => element.textContent));

	if (usernames.size === 0) {
		return;
	}

	// Save the nodes now because they change position after the name insertion
	const extraCopy = batchedUsernameElements.map(element => element.parentNode!.nextSibling!).filter(Boolean);

	const names = await api.v4(
		[...usernames].map(user =>
			api.escapeKey(user) + `: user(login: "${user}") {name}`,
		).join(','),
	);

	for (const usernameElement of batchedUsernameElements) {
		const username = usernameElement.textContent;
		const userKey = api.escapeKey(username);
		const {name} = names[userKey];

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
		insertionPoint.after(
			' ',
			<span className="color-fg-muted css-truncate d-inline-block">
				(<bdo className="css-truncate-target" style={{maxWidth: '200px'}}>{name}</bdo>)
			</span>,
			' ',
		);
	}

	// This change is ideal but should not break the feature if it fails, so leave it for last
	dropExtraCopy(extraCopy);
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
- PR with reviews: https://github.com/rust-lang/rfcs/pull/2544
- mannequins: https://togithub.com/python/cpython/issues/67591
- newsfeed: https://github.com

*/
