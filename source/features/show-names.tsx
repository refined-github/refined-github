import './show-names.css';
import React from 'dom-chef';
import select from 'select-dom';
import * as api from '../libs/api';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import {getUsername, compareNames} from '../libs/utils';

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
		if (commentedNode && commentedNode.textContent!.includes('commented')) {
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
		if (names[userKey] && names[userKey].name) {
			// If it's a regular comment author, add it outside <strong>
			// otherwise it's something like "User added some commits"
			if (compareNames(username, names[userKey].name)) {
				usernameElement.textContent = names[userKey].name;
			} else {
				const insertionPoint = usernameElement.parentElement!.tagName === 'STRONG' ? usernameElement.parentElement! : usernameElement;
				insertionPoint.after(
					' (',
					<bdo className="css-truncate">
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

features.add({
	id: __filebasename,
	description: 'Adds the real name of users by their usernames.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/62075835-5f82ce00-b270-11e9-91eb-4680b70cb3cb.png'
}, {
	include: [
		pageDetect.isDashboard
	],
	repeatOnAjax: false,
	init
}, {
	include: [
		pageDetect.hasComments
	],
	init
});
