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

import mem from 'mem';
import * as pageDetect from 'github-url-detection';
import {JsonObject, AsyncReturnType} from 'type-fest';

import features from '../feature-manager.js';
import {getRepo} from './index.js';
import optionsStorage from '../options-storage.js';

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

export const escapeKey = (...keys: Array<string | number>): string => '_' + String(keys).replaceAll(/[^a-z\d]/gi, '_');

export class RefinedGitHubAPIError extends Error {
	response: AnyObject = {};
	constructor(...messages: string[]) {
		super(messages.join('\n'));
	}
}

const settings = optionsStorage.getAll();
export async function expectToken(): Promise<string> {
	const {personalToken} = await settings;
	if (!personalToken) {
		throw new Error('Personal token required for this feature');
	}

	return personalToken;
}

export async function expectTokenScope(scope: string): Promise<void> {
	const {headers} = await v3('/');
	const tokenScopes = headers.get('X-OAuth-Scopes')!;
	if (!tokenScopes.split(', ').includes(scope)) {
		throw new Error('The token you provided does not have ' + (tokenScopes ? `the \`${scope}\` scope. It only includes \`${tokenScopes}\`.` : 'any scope. You can change the scope of your token at https://github.com/settings/tokens'));
	}
}

const api3 = pageDetect.isEnterprise()
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

export const v3 = mem(async (
	query: string,
	options: GHRestApiOptions = v3defaults,
): Promise<RestResponse> => {
	const {ignoreHTTPStatus, method, body, headers, json} = {...v3defaults, ...options};
	const {personalToken} = await settings;

	if (!query.startsWith('https')) {
		query = query.startsWith('/') ? query.slice(1) : ['repos', getRepo()!.nameWithOwner, query].filter(Boolean).join('/');
	}

	const url = new URL(query, api3);
	features.log.http(url);
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
}, {
	cacheKey: JSON.stringify,
});

export const v3paginated = async function * (
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

export const v4uncached = async (
	query: string,
	options: GHGraphQLApiOptions = v4defaults,
): Promise<AnyObject> => {
	const personalToken = await expectToken();

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

	const fullQuery = /^\s*(query|mutation)/.test(query)
		? query
		: parameters.length === 0
			? `query {${query}}`
			: `query (${parameters.join(',')}) {${query}}`;

	features.log.http(fullQuery);

	const response = await fetch(api4, {
		headers: {
			'User-Agent': 'Refined GitHub',
			'Content-Type': 'application/json',
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

export const v4 = mem(v4uncached, {
	cacheKey([query, options]) {
		// `repository()` uses global state and must be handled explicitly
		// https://github.com/refined-github/refined-github/issues/5821
		// https://github.com/sindresorhus/eslint-plugin-unicorn/issues/1864
		const key = [query, options];
		if (query.includes('repository() {')) {
			key.push(getRepo()?.nameWithOwner);
		}

		return JSON.stringify(key);
	},
});

export async function getError(apiResponse: JsonObject): Promise<RefinedGitHubAPIError> {
	const {personalToken} = await settings;

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

	const error = new RefinedGitHubAPIError(
		'Unable to fetch.',
		personalToken
			? 'Ensure that your token has access to this repo.'
			: 'Maybe adding a token in the options will fix this issue.',
		JSON.stringify(apiResponse, null, '\t'), // Beautify
	);
	error.response = apiResponse;
	return error;
}

// Export single API object as default
export * as default from './api.js';
