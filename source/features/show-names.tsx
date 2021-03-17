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
		'.js-discussion a.author:not(.rgh-fullname):not([href*="/apps/"]):not([href*="/marketplace/"]):not([data-hovercard-type="organization"])', // `a` selector needed to skip commits by non-GitHub users.
		'#dashboard a.text-bold[data-hovercard-type="user"]:not(.rgh-fullname)' // On dashboard `.text-bold` is required to not fetch avatars.
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
			api.escapeKey(user) + `: user(login: "${user}") {name}`
		).join()
	);

	for (const usernameElement of usernameElements) {
		const username = usernameElement.textContent!;
		const userKey = api.escapeKey(username);

		// For the currently logged in user, `names[userKey]` would not be present.
		if (names[userKey]?.name) {
			// If it's a regular comment author, add it outside <strong>
			// otherwise it's something like "User added some commits"
			if (compareNames(username, names[userKey].name)) {
				usernameElement.textContent = names[userKey].name;
			} else {
				const insertionPoint = usernameElement.parentElement!.tagName === 'STRONG' ? usernameElement.parentElement! : usernameElement;
				insertionPoint.after(
					' (',
					<bdo className="css-truncate" style={{display: 'inline-block'}}>
						<span className="css-truncate-target" style={{maxWidth: '200px'}}>
							{names[userKey].name}
						</span>
					</bdo>,
					') '
				);
			}
		}
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isDashboard
	],
	additionalListeners: [
		onNewsfeedLoad
	],
	init: onetime(init)
}, {
	include: [
		pageDetect.hasComments
	],
	init
});
