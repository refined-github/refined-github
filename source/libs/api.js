const cache = new Map();

export default async endpoint => {
	if (cache.has(endpoint)) {
		return cache.get(endpoint);
	}
	const api = location.hostname === 'github.com' ? 'https://api.github.com/' : `${location.origin}/api/`;
	const response = await fetch(api + endpoint);
	const json = await response.json();
	cache.set(endpoint, json);
	return json;
};
