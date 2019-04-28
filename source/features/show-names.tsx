import './show-names.css';
import React from 'dom-chef';
import select from 'select-dom';
import * as api from '../libs/api';
import features from '../libs/features';
import {getUsername} from '../libs/utils';

async function init(): Promise<false | void> {
	// `a` selector needed to skip commits by non-GitHub users
	const usernameElements = select.all('.js-discussion a.author:not(.rgh-fullname):not([href*="/apps/"])');

	const usernames = new Set();
	const myUsername = getUsername();
	for (const el of usernameElements) {
		el.classList.add('rgh-fullname');
		const username = el.textContent;
		if (username !== myUsername && username !== 'ghost') {
			usernames.add(el.textContent);
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
			) +
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
	id: 'show-names',
	include: [
		features.hasComments
	],
	load: features.onNewComments,
	init
});
