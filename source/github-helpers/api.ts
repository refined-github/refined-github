/*
These will throw `RefinedGitHubAPIError` if something goes wrong or if it's a 404.
Probably don't catch them so they will appear in the console
next to the name of the feature that caused them.

Usage:

import api from '../github-helpers/api.js';
const user = await api.v3(`/users/${username}`);
const repositoryCommits = await api.v3('commits'); // Without a leading `/`, this is equivalent to `/repo/$current-repository/commits`
const data = await api.v4('{user(login: "user") {name}}');

Returns:
a Promise that resolves into an object.

If the response body is empty, you'll receive an object like {status: 200}

The second argument is an options object,
it lets you define accept error HTTP codes as a valid response, like:

{
	ignoreHTTPStatus: true
}

so the call will not throw an error but it will return as usual.
*/

import mem from 'memoize';
import * as pageDetect from 'github-url-detection';
import type {JsonObject, AsyncReturnType} from 'type-fest';

import {getRepo} from './index.js';
import {getToken} from '../options-storage.js';
import {log} from '../helpers/feature-helpers.js';

type JsonError = {
	message: string;
};

type GraphQLResponse = {
	message?: string;
	data?: JsonObject;
	errors?: JsonError[];
};

type RestResponse = {
	httpStatus: number;
	headers: Headers;
	ok: boolean;
} & AnyObject;

const escapeKey = (...keys: Array<string | number>): string => '_' + String(keys).replaceAll(/[^a-z\d]/gi, '_');

export class RefinedGitHubAPIError extends Error {
	response: AnyObject = {};
	constructor(...messages: string[]) {
		super(messages.join('\n'));
	}
}

export const api3 = pageDetect.isEnterprise()
	? `${location.origin}/api/v3/`
	: 'https://api.github.com/';

const api4 = pageDetect.isEnterprise()
	? `${location.origin}/api/graphql`
	: 'https://api.github.com/graphql';

type GHRestApiOptions = {
	ignoreHTTPStatus?: boolean;
	method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
	body?: JsonObject;
	headers?: HeadersInit;
	json?: boolean;
};

type GHGraphQLApiOptions = {
	allowErrors?: boolean;
	variables?: JsonObject;
};

const v3defaults: GHRestApiOptions = {
	ignoreHTTPStatus: false,
	method: 'GET',
	body: undefined,
	json: true,
};

const v4defaults: GHGraphQLApiOptions = {
	allowErrors: false,
};

const v3uncached = async (
	query: string,
	options: GHRestApiOptions = v3defaults,
): Promise<RestResponse> => {
	const {ignoreHTTPStatus, method, body, headers, json} = {...v3defaults, ...options};
	const personalToken = await getToken();

	if (!query.startsWith('https')) {
		query = query.startsWith('/') ? query.slice(1) : ['repos', getRepo()!.nameWithOwner, query].filter(Boolean).join('/');
	}

	const url = new URL(query, api3);
	log.http(url.href);
	const response = await fetch(url.href, {
		method,
		body: body && JSON.stringify(body),
		headers: {
			'User-Agent': 'Refined GitHub',
			Accept: 'application/vnd.github.v3+json',
			...headers,
			...personalToken && {Authorization: `token ${personalToken}`},
		},
	});
	const textContent = await response.text();
	const apiResponse = json ? JSON.parse(textContent) : {textContent};

	if (response.ok || ignoreHTTPStatus) {
		return Object.assign(apiResponse, {
			httpStatus: response.status,
			headers: response.headers,
			ok: response.ok,
		});
	}

	throw await getError(apiResponse);
};

const v3 = mem(v3uncached, {
	cacheKey: JSON.stringify,
});

const v3paginated = async function * (
	query: string,
	options?: GHRestApiOptions,
): AsyncGenerator<AsyncReturnType<typeof v3>> {
	while (true) {
		// eslint-disable-next-line no-await-in-loop
		const response = await v3(query, options);
		yield response;

		const match = /<([^>]+)>; rel="next"/.exec(response.headers.get('link')!);
		if (match) {
			query = match[1]!;
		} else {
			return;
		}
	}
};

const v3hasAnyItems = async (
	query: string,
	options: GHRestApiOptions = {},
): Promise<boolean> => {
	const url = new URL(query, api3);
	url.searchParams.set('per_page', '1'); // Ensure we create pagination after 1 item
	url.searchParams.set('page', '9999'); // Get an empty response
	const {headers} = await v3(url.pathname + url.search, options);

	// If there's more than 1 item, we get a `Link` header
	return headers.has('link');
};

const v4uncached = async (
	query: string,
	options: GHGraphQLApiOptions = v4defaults,
): Promise<AnyObject> => {
	const personalToken = await getToken();

	if (!personalToken) {
		throw new RefinedGitHubAPIError('Personal token required for this feature');
	}

	// TODO: Remove automatic usage of globals via `getRepo()`
	// https://github.com/refined-github/refined-github/issues/5821
	const currentRepoIfAny = getRepo(); // Don't destructure, it's `undefined` outside repos
	query = query.replace('repository() {', () => 'repository(owner: $owner, name: $name) {');

	// Automatically provide variables common variables only when used.
	// GraphQL doesn't like unused variables.
	const variables: JsonObject = {};
	const parameters: string[] = [];
	if (query.includes('$owner')) {
		variables.owner = currentRepoIfAny!.owner;
		parameters.push('$owner: String!');
	}

	if (query.includes('$name')) {
		variables.name = currentRepoIfAny!.name;
		parameters.push('$name: String!');
	}

	Object.assign(variables, options.variables);

	const fullQuery = /^\s*(?:query|mutation)/.test(query)
		? query
		: parameters.length === 0
			? `query {${query}}`
			: `query (${parameters.join(',')}) {${query}}`;

	log.http(fullQuery);

	const response = await fetch(api4, {
		headers: {
			'User-Agent': 'Refined GitHub',
			'Content-Type': 'application/json',
			// eslint-disable-next-line @typescript-eslint/naming-convention -- External API
			Authorization: `bearer ${personalToken}`,
		},
		method: 'POST',
		body: JSON.stringify({
			variables,
			query: fullQuery,
		}),
	});

	const apiResponse: GraphQLResponse = await response.json();

	const {
		data = {},
		errors = [],
	} = apiResponse;

	if (errors.length > 0 && !options.allowErrors) {
		throw new RefinedGitHubAPIError('GraphQL:', ...errors.map(error => error.message));
	}

	if (response.ok) {
		return data;
	}

	throw await getError(apiResponse as JsonObject);
};

const v4 = mem(v4uncached, {
	cacheKey([query, options]) {
		// `repository()` uses global state and must be handled explicitly
		// https://github.com/refined-github/refined-github/issues/5821
		// https://github.com/sindresorhus/eslint-plugin-unicorn/issues/1864
		const key = [query, options];
		if (query.includes('repository() {') || query.includes('owner: $owner, name: $name')) {
			key.push(getRepo()?.nameWithOwner);
		}

		return JSON.stringify(key);
	},
});

async function getError(apiResponse: JsonObject): Promise<RefinedGitHubAPIError> {
	const personalToken = await getToken();

	if ((apiResponse.message as string)?.includes('API rate limit exceeded')) {
		return new RefinedGitHubAPIError(
			'Rate limit exceeded.',
			personalToken
				? 'It may be time for a walk! 🍃 🌞'
				: 'Set your token in the options or take a walk! 🍃 🌞',
		);
	}

	if (apiResponse.message === 'Bad credentials') {
		return new RefinedGitHubAPIError(
			'The token seems to be incorrect or expired. Update it in the options.',
		);
	}

	if ((apiResponse.message as string)?.includes('without `workflow` scope')) {
		return new RefinedGitHubAPIError(
			'To update workflow files, you need to add the `workflow` scope to your token. Update your token at https://github.com/settings/tokens',
		);
	}

	const error = new RefinedGitHubAPIError(
		'Unable to fetch.',
		personalToken
			? 'Ensure that your token has access to this repo.'
			: 'Maybe adding a token in the options will fix this issue.',
		JSON.stringify(apiResponse, undefined, '\t'), // Beautify
	);
	error.response = apiResponse;
	return error;
}

const api = {
	v3,
	v4,
	v3paginated,
	v3hasAnyItems,
	v3uncached,
	v4uncached,
	escapeKey,
	getError,
};

export default api;
