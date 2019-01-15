import {h} from 'dom-chef';
import select from 'select-dom';
import * as api from '../libs/api';
import features from '../libs/features';
import {getUsername, escapeForGql} from '../libs/utils';

async function init() {
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
		const commentedNode = el.parentNode.nextSibling;
		if (commentedNode && commentedNode.textContent.includes('commented')) {
			commentedNode.remove();
		}
	}

	if (usernames.size === 0) {
		return false;
	}

	const names = await api.v4(
		'{' +
			[...usernames].map(user =>
				escapeForGql(user) + `: user(login: "${user}") {name}`
			) +
		'}'
	);

	for (const usernameEl of usernameElements) {
		const {name} = names[escapeForGql(usernameEl.textContent)] || {};
		if (name) {
			// If it's a regular comment author, add it outside <strong>
			// otherwise it's something like "User added some commits"
			const insertionPoint = usernameEl.parentNode.tagName === 'STRONG' ? usernameEl.parentNode : usernameEl;
			insertionPoint.after(' (', <bdo>{name}</bdo>, ') ');
		}
	}
}

features.add({
	id: 'show-names',
	include: [
		features.isPR,
		features.isIssue,
		features.isCommit,
		features.isDiscussion
	],
	load: features.onNewComments,
	init
});
