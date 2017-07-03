import select from 'select-dom';
import domify from './domify';
import {getUsername, groupBy} from './utils';

const storageKey = 'cachedNames';

const getCachedUsers = () => {
	return new Promise(resolve => chrome.storage.local.get(storageKey, resolve));
};

const fetchName = async username => {
	// /following/you_know is the lightest page we know
	// location.origin is required for Firefox #490
	const pageHTML = await fetch(`${location.origin}/${username}/following`)
		.then(res => res.text());

	const el = domify(pageHTML).querySelector('h1 strong');

	// The full name might not be set
	const fullname = el && el.textContent.slice(1, -1);
	if (!fullname || fullname === username) {
		// It has to be stored as false or else it will be fetched every time
		return false;
	}
	return fullname;
};

export default async () => {
	const myUsername = getUsername();
	const cache = (await getCachedUsers())[storageKey];

	// {sindresorhus: [a.author, a.author], otheruser: [a.author]}
	const selector = `.js-discussion .author:not(.refined-has-full-name)`;
	const usersOnPage = groupBy(select.all(selector), el => el.textContent);

	const fetchAndAdd = async username => {
		if (typeof cache[username] === 'undefined' && username !== myUsername) {
			cache[username] = await fetchName(username);
		}

		for (const usernameEl of usersOnPage[username]) {
			// `myUsername` might still be cached, but we still don't want it
			if (cache[username] && username !== myUsername) {
				usernameEl.insertAdjacentHTML('afterend', `<span>(${cache[username]})</span>`);
				usernameEl.classList.add('refined-has-full-name');
			}
			// Drop 'commented'
			usernameEl.parentNode.nextSibling.remove();
		}
	};

	const fetches = Object.keys(usersOnPage).map(fetchAndAdd);

	// Wait for all the fetches to be done
	await Promise.all(fetches);

	chrome.storage.local.set({[storageKey]: cache});
};
