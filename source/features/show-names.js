import {h} from 'dom-chef';
import select from 'select-dom';
import domify from '../libs/domify';
import * as cache from '../libs/cache';
import {getUsername, groupBy} from '../libs/utils';

const fetchName = async username => {
	// /following/you_know is the lightest page we know
	// location.origin is required for Firefox #490
	const response = await fetch(`${location.origin}/${username}/following`, {credentials: 'same-origin'});
	const dom = domify(await response.text());

	const el = dom.querySelector('h1 strong');

	// The full name might not be set
	const fullname = el && el.textContent.slice(1, -1);
	if (!fullname || fullname === username) {
		// It has to be stored as false or else it will be fetched every time
		return false;
	}
	return fullname;
};

export default () => {
	const myUsername = getUsername();
	const commentsList = select.all('.js-discussion .author:not(.rgh-fullname):not([href*="/apps/"])');

	// {sindresorhus: [a.author, a.author], otheruser: [a.author]}
	const usersOnPage = groupBy(commentsList, el => el.textContent);

	// Drop 'commented' label to shorten the copy
	for (const usernameEl of commentsList) {
		const commentedNode = usernameEl.parentNode.nextSibling;
		if (commentedNode && commentedNode.textContent.includes('commented')) {
			commentedNode.remove();
		}
	}

	const fetchAndAdd = async username => {
		if (username === myUsername) {
			return;
		}

		const cacheKey = `full-name:${username}`;
		let fullname = await cache.get(cacheKey);
		if (fullname === undefined) {
			fullname = await fetchName(username);
			cache.set(cacheKey, fullname);
		}
		if (!fullname) {
			return;
		}

		for (const usernameEl of usersOnPage[username]) {
			usernameEl.classList.add('rgh-fullname');

			// If it's a regular comment author, add it outside <strong>
			// otherwise it's something like "User added some commits"
			const insertionPoint = usernameEl.parentNode.tagName === 'STRONG' ? usernameEl.parentNode : usernameEl;
			insertionPoint.after(' (', <bdo>{fullname}</bdo>, ') ');
		}
	};

	Object.keys(usersOnPage).map(fetchAndAdd);
};
