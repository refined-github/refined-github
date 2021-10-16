import './show-names.css';
import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import onNewsfeedLoad from '../github-events/on-newsfeed-load';
import {getUsername, compareNames} from '../github-helpers';

async function init(): Promise<false | void> {
	const usernameElements = select.all([
		'.js-discussion a.author:not(.rgh-fullname, [href*="/apps/"], [href*="/marketplace/"], [data-hovercard-type="organization"])', // `a` selector needed to skip commits by non-GitHub users.
		'#dashboard a.text-bold[data-hovercard-type="user"]:not(.rgh-fullname)', // On dashboard `.text-bold` is required to not fetch avatars.
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

		// For the currently logged in user, `names[userKey]` would not be present.
		const {name} = names[userKey] ?? {};

		if (name) {
			// If it's a regular comment author, add it outside <strong>
			// otherwise it's something like "User added some commits"
			if (compareNames(username, name)) {
				usernameElement.textContent = name;
			} else {
				const insertionPoint = usernameElement.parentElement!.tagName === 'STRONG'
					? usernameElement.parentElement!
					: usernameElement;
				insertionPoint.after(
					' ',
					<span className="color-text-secondary css-truncate d-inline-block">
						(<bdo className="css-truncate-target" style={{maxWidth: '200px'}}>{name}</bdo>)
					</span>,
					' ',
				);
			}
		}
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isDashboard,
	],
	additionalListeners: [
		onNewsfeedLoad,
	],
	// TODO [2022-02-01]: Use `onlyAdditionalListeners` #4876
	init: onetime(init),
}, {
	include: [
		pageDetect.hasComments,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
