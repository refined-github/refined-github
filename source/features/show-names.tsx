import './show-names.css';
import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import onNewsfeedLoad from '../github-events/on-newsfeed-load';
import {getUsername, compareNames} from '../github-helpers';

async function init(): Promise<false | void> {
	const usernameElements = select.all([
		// `a` selector needed to skip commits by non-GitHub users
		':is(.js-discussion, .inline-comments) a.author:not(.rgh-fullname, [href*="/apps/"], [href*="/marketplace/"], [data-hovercard-type="organization"])',

		// On dashboard `.text-bold` is required to not fetch avatars
		'#dashboard a.text-bold[data-hovercard-type="user"]:not(.rgh-fullname)',
	]);

	const usernames = new Set<string>();
	const myUsername = getUsername();
	for (const element of usernameElements) {
		element.classList.add('rgh-fullname');
		const username = element.textContent;
		if (username && username !== myUsername && username !== 'ghost') {
			usernames.add(element.textContent!);
		}

		// Drop 'commented' label to shorten the copy
		const commentedNode = element.parentNode!.nextSibling;
		if (commentedNode?.textContent!.includes('commented')) {
			commentedNode.remove();
		}
	}

	if (usernames.size === 0) {
		return false;
	}

	const names = await api.v4(
		[...usernames].map(user =>
			api.escapeKey(user) + `: user(login: "${user}") {name}`,
		).join(','),
	);

	for (const usernameElement of usernameElements) {
		const username = usernameElement.textContent!;
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
			<span className="color-text-secondary color-fg-muted css-truncate d-inline-block">
				(<bdo className="css-truncate-target" style={{maxWidth: '200px'}}>{name}</bdo>)
			</span>,
			' ',
		);
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isDashboard,
	],
	additionalListeners: [
		onNewsfeedLoad,
	],
	onlyAdditionalListeners: true,
	init,
}, {
	include: [
		pageDetect.hasComments,
	],
	onlyAdditionalListeners: true,
	deduplicate: false,
	init,
});
