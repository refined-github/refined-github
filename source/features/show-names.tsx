import './show-names.css';
import React from 'dom-chef';
import select from 'select-dom';
import * as api from '../libs/api';
import features from '../libs/features';
import observeEl from '../libs/simplified-element-observer';
import {getUsername} from '../libs/utils';

async function updateAndWatch([{addedNodes}]: MutationRecord[], observer: MutationObserver): Promise<void> {
	await fetchAndAppendUsernames();

	// Observe the new ajaxed-in containers
	for (const node of addedNodes) {
		if (node instanceof HTMLDivElement) {
			observer.observe(node, {childList: true});
		}
	}
}

async function init(): Promise<false | void> {
	if (features.isDashboard()) {
		observeEl('.news', updateAndWatch);
	} else {
		return await fetchAndAppendUsernames(); // This is called by observeEl, so it needs to be inside `else`
	}
}

async function fetchAndAppendUsernames(): Promise<false | void> {
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
	description: 'The full name of users is shown next to their username',
	include: [
		features.hasComments,
		features.isDashboard
	],
	load: features.onNewComments,
	init
});
