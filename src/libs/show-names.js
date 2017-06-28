import select from 'select-dom';
import {groupBy} from 'lodash-es';
import domify from './domify';

const storageKey = 'cachedNames';
const usersSelectors = '.js-discussion .author:not(.refined-has-full-name)';

const getCachedUsers = () => {
	return new Promise(resolve => chrome.storage.local.get(storageKey, resolve));
};

const fetchName = async username => {
	// /following/you_know is the lightest page we know
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
	const cache = (await getCachedUsers())[storageKey];

	// {sindresorhus: [a.author, a.author], otheruser: [a.author]}
	const usersOnPage = groupBy(select.all(usersSelectors), 'textContent');

	const fetchAndAdd = async username => {
		if (typeof cache[username] === 'undefined') {
			cache[username] = await fetchName(username);
		}

		for (const usernameEl of usersOnPage[username]) {
			if (cache[username]) {
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
