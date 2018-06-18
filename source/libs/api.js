import OptionsSync from 'webext-options-sync';

const cache = new Map();

export default async endpoint => {
	if (cache.has(endpoint)) {
		return cache.get(endpoint);
	}
	const headers = {};
	const {personalTokens} = await new OptionsSync().getAll();
	if (personalTokens && personalTokens[location.hostname]) {
		headers.Authorization = `token ${personalTokens[location.hostname]}`;
	}
	const api = location.hostname === 'github.com' ? 'https://api.github.com/' : `${location.origin}/api/v3/`;
	const response = await fetch(api + endpoint, {headers});
	const json = await response.json();
	cache.set(endpoint, json);
	return json;
};
