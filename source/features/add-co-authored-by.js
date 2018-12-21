import select from 'select-dom';
import * as api from '../libs/api';
import {getUsername, escapeForGql} from '../libs/utils';
import onNewComments from '../libs/on-new-comments';

async function addCoAuthoredBy() {
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
		return;
	}

	const {data} = await api.v4(
		'{' +
			[...usernames].map(user =>
				escapeForGql(user) + `: user(login: "${user}") {databaseId, name, email}`
			) +
		'}'
	);

	const coAuthors = [...usernames].reduce((coAuthorString, username) => {
		const {name, databaseId, email} = data[escapeForGql(username)] || {};
		const commitEmail = email || `${databaseId}+${username}@users.noreply.github.com`;
		return coAuthorString + `Co-authored-by: ${name} <${commitEmail}>\n`;
	}, '');

	const commitMessageElements = select.all('textarea[name="commit_message');
	for (const messageEl of commitMessageElements) {
		const oldMessage = messageEl.value.replace(/Co-Authored-By:.*/m, '').trim();
		messageEl.value = `${oldMessage}\n\n${coAuthors}`;
	}
}

export default function () {
	addCoAuthoredBy();
	onNewComments(addCoAuthoredBy);
}
