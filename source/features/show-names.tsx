import React from 'dom-chef';
import select from 'select-dom';
import * as api from '../libs/api';
import features from '../libs/features';
import {getUsername} from '../libs/utils';

async function init(): Promise<false | void> {
	const usernameElements = select.all('.js-discussion .author:not(.rgh-fullname):not([href*="/apps/"])');

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
		if (names[userKey].name) {
			// If it's a regular comment author, add it outside <strong>
			// otherwise it's something like "User added some commits"
			const insertionPoint = usernameEl.parentElement!.tagName === 'STRONG' ? usernameEl.parentElement! : usernameEl;
			insertionPoint.after(
				' (',
				<bdo className="css-truncate">
					<span className="css-truncate-target" style={{maxWidth: '200px'}}>
						{name}
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
