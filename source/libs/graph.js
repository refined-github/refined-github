import OptionsSync from 'webext-options-sync';

const cache = new Map();

export default async query => {
	if (cache.has(query)) {
		return cache.get(query);
	}
	const headers = {
		'User-Agent': 'Refined GitHub'
	};
	const {personalToken} = await new OptionsSync().getAll();
	if (personalToken) {
		headers.Authorization = `bearer ${personalToken}`;
	}
	const api = location.hostname === 'github.com' ? 'https://api.github.com/graphql' : `${location.origin}/api/graphql`;
	try {
		const response = await fetch(api, {
			method: 'POST',
			headers,
			body: JSON.stringify({query})
		});
		const {data} = await response.json();
		cache.set(query, data);
		return data;
	} catch (error) {
		const errorObject = JSON.parse(JSON.stringify(error));
		if (errorObject.response.status) {
			console.log(`Refined GitHub couldn’t access this endpoint as it requires you to be authenticated ⛔. Please make sure you have a valid access token (check ${errorObject.response.documentation_url})`);
		}
		return null;
	}
};
