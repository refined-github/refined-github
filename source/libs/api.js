/*
Usage:

import * as api from '../libs/api';

const user  = await api.v3(`users/${username}`);
const {data} = await api.v4(graphQuery);

 */

import OptionsSync from 'webext-options-sync';

const api = location.hostname === 'github.com' ? 'https://api.github.com/' : `${location.origin}/api/`;

const cache = new Map();

export const v3 = query => call(fetch3, query);
export const v4 = query => call(fetch4, query);

function fetch3(query, personalToken) {
	const headers = {
		'User-Agent': 'Refined GitHub',
		Accept: 'application/vnd.github.v3+json'
	};
	if (personalToken) {
		headers.Authorization = `token ${personalToken}`;
	}
	return fetch(api + query, {headers});
}

function fetch4(query, personalToken) {
	if (!personalToken) {
		throw new Error('Personal token required for this feature');
	}
	return fetch(api + 'graphql', {
		headers: {
			'User-Agent': 'Refined GitHub',
			Authorization: `bearer ${personalToken}`
		},
		method: 'POST',
		body: JSON.stringify({query})
	});
}

// Main function: handles cache, options, errors
async function call(fetch, query) {
	if (cache.has(query)) {
		return cache.get(query);
	}
	const {personalToken} = await new OptionsSync().getAll();
	const response = await fetch(query, personalToken);
	const json = await response.json();

	if (response.ok) {
		cache.set(query, json);
	} else if (json.message.includes('API rate limit exceeded')) {
		console.error(
			'Refined GitHub hit GitHub API’s rate limit.',
			personalToken ? 'It may be time for a walk! 🍃 🌞' : 'Set your token in the options or take a walk! 🍃 🌞',
		);
	} else if (json.message === 'Bad credentials') {
		console.error(
			'Refined GitHub couldn’t use GitHub’s API because the token seems to be incorrect or expired. Update it in the options.'
		);
	} else {
		console.error(
			'Refined GitHub wasn’t able to fetch GitHub’s API.',
			personalToken ? 'Ensure that your token has access to this repo.' : 'Maybe adding a token in the options will fix this issue.',
			'\n',
			JSON.stringify(json, null, '\t')
		);
	}
	return json;
}
