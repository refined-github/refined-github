import './show-names.css';
import React from 'dom-chef';
import select from 'select-dom';
import * as api from '../libs/api';
import features from '../libs/features';
import {getUsername} from '../libs/utils';

async function init(): Promise<false | void> {
	const usernameElements = select.all([
		'.js-discussion a.author:not(.rgh-fullname):not([href*="/apps/"]):not([href*="/marketplace/"]):not([data-hovercard-type="organization"])', // `a` selector needed to skip commits by non-GitHub users.
		'#dashboard a.text-bold[data-hovercard-type="user"]:not(.rgh-fullname)' // On dashboard `.text-bold` is required to not fetch avatars.
	].join());

	const usernames = new Set<string>();
	const myUsername = getUsername();
	for (const el of usernameElements) {
		el.classList.add('rgh-fullname');
		const username = el.textContent;
		if (username && username !== myUsername && username !== 'ghost') {
			usernames.add(el.textContent!);
		}

		// Drop 'commented' label to shorten the copy
		const commentedNode = el.parentNode!.nextSibling as Text;
		if (commentedNode && commentedNode.textContent!.includes('commented')) {
			commentedNode.remove();
		}
	}

	if (usernames.size === 0) {
		return false;
	}

	const names = await api.v4(
		'{' +
			[...usernames].map(user =>
				api.escapeKey(user) + `: user(login: "${user}") {name}`
			).join() +
		'}'
	);

	for (const usernameEl of usernameElements) {
		const userKey = api.escapeKey(usernameEl.textContent!);

		// For the currently logged in user, `names[userKey]` would not be present.
		if (names[userKey] && names[userKey].name) {
			// If it's a regular comment author, add it outside <strong>
			// otherwise it's something like "User added some commits"
			const insertionPoint = usernameEl.parentElement!.tagName === 'STRONG' ? usernameEl.parentElement! : usernameEl;
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

features.add({
	id: __featureName__,
	description: 'Adds the real name of users next to their usernames.',
	screenshot: 'https://cloud.githubusercontent.com/assets/170270/16172068/0a67b98c-3580-11e6-92f0-6fc930ee17d1.png',
	include: [
		features.isDashboard
	],
	load: features.onNewsfeedLoad,
	init
});

features.add({
	id: __featureName__,
	description: false,
	screenshot: false,
	include: [
		features.hasComments
	],
	load: features.onNewComments,
	init
});
