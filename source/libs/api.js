import OptionsSync from 'webext-options-sync';

const cache = new Map();

export default async (endpoint, options) => {
	options = {
		accept404: true,
		...options
	};

	if (cache.has(endpoint)) {
		return cache.get(endpoint);
	}
	const headers = {
		'User-Agent': 'Refined GitHub',
		Accept: 'application/vnd.github.v3+json'
	};
	const {personalToken} = await new OptionsSync().getAll();
	if (personalToken) {
		headers.Authorization = `token ${personalToken}`;
	}
	const api = location.hostname === 'github.com' ? 'https://api.github.com/' : `${location.origin}/api/`;
	const response = await fetch(api + endpoint, {headers});
	const content = await response.text();
	const json = content.length > 0 ? JSON.parse(content) : response.ok;

	if (response.ok || (options.accept404 && response.status === 404)) {
		cache.set(endpoint, json);
	} else if (json.message.includes('API rate limit exceeded')) {
		console.error(
			'Refined GitHub hit GitHub API’s rate limit. Set your token in the options or take a walk! 🍃 🌞'
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
};
