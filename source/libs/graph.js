import OptionsSync from 'webext-options-sync';
import {GraphQLClient} from 'graphql-request';

const cache = new Map();

export default async query => {
	function hashCode(s) {
		return s.split('').reduce((a, b) => {
			a = ((a << 5) - a) + b.charCodeAt(0);
			return a & a;
		}, 0);
	}

	const queryHash = hashCode(query);
	if (cache.has(queryHash)) {
		return cache.get(queryHash);
	}
	const headers = {
		'User-Agent': 'Refined GitHub'
	};
	const {personalToken} = await new OptionsSync().getAll();
	if (personalToken) {
		headers.Authorization = `bearer ${personalToken}`;
	}
	const api = 'https://api.github.com/graphql';
	const client = new GraphQLClient(api, {headers});

	try {
		const response = await client.request(query);
		cache.set(queryHash, response);
		return response;
	} catch (error) {
		const errorObject = JSON.parse(JSON.stringify(error));
		if (errorObject.response.status) {
			console.log(`Refined GitHub couldn’t access this endpoint as it requires you to be authenticated ⛔. Please make sure you have a valid access token (check ${errorObject.response.documentation_url})`);
		}
		return null;
	}
};
