const storageKey = 'cachedNames';

const getCachedUsers = cb => {
	chrome.storage.local.get(storageKey, data => cb(data[storageKey]));
};

const updateCachedUsers = users => {
	chrome.storage.local.set({[storageKey]: users});
};

const addUsersName = (user, name) => {
	const $usernameLinks = $(`.author[href="/${user}"]:not(.has-full-name)`);
	$usernameLinks.each((i, userLink) => {
		const $userLink = $(userLink);
		if (user !== name) {
			$userLink.after(`<span class="comment-full-name">(${name})</span>`);
		}
		$userLink.addClass('has-full-name');
		const $header = $userLink.parent().parent();
		if ($header.hasClass('timeline-comment-header-text')) {
			// Remove 'commented'
			$userLink[0].parentNode.nextSibling.remove();
		}
	});
};

export default () => {
	getCachedUsers((users = {}) => {
		const usersOnPage = $('.js-discussion .author').get().map(el => el.innerText);
		const uniqueUsers = new Set(usersOnPage);

		// Add cached users to DOM first, since the calls for everyone else will be slow
		for (const user of uniqueUsers) {
			const cachedName = users[user];
			if (cachedName) {
				addUsersName(user, cachedName);
				uniqueUsers.delete(user);
			}
		}

		const userUrl = user => `${location.origin}/${user}/following`;
		const requests = Array.from(uniqueUsers).map(username => {
			const req = fetch(userUrl(username));
			return req.then(res => res.text()).then(profile => ({
				username,
				profile
			}));
		});

		Promise.all(requests).then(profiles => {
			const userCache = {};

			for (const {username, profile} of profiles) {
				const profileDOM = new DOMParser().parseFromString(profile, 'text/html');
				const fullname = $(profileDOM).find('h1 strong').text().slice(1, -1);

				// Possible for a user to not set a name
				if (fullname) {
					userCache[username] = fullname;
					addUsersName(username, fullname);
				}
			}

			updateCachedUsers(Object.assign({}, users, userCache));
		}).catch(console.error);
	});
};
