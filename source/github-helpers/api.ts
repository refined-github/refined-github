/*
These will throw `RefinedGitHubAPIError` if something goes wrong or if it's a 404.
Probably don't catch them so they will appear in the console
next to the name of the feature that caused them.

Usage:

import * as api from '../github-helpers/api';
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

import {getRepo} from '.';
import optionsStorage from '../options-storage';

interface JsonError {
	message: string;
}

interface GraphQLResponse {
	message?: string;
	data?: JsonObject;
	errors?: JsonError[];
}

interface RestResponse extends AnyObject {
	httpStatus: number;
	headers: Headers;
	ok: boolean;
}

export const escapeKey = (value: string | number): string => '_' + String(value).replace(/[ ./-]/g, '_');

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
		throw new Error(`The token you provided does not have the \`${scope}\` scope. It only includes \`${tokenScopes}\``);
	}
}

const api3 = pageDetect.isEnterprise() ?
	`${location.origin}/api/v3/` :
	'https://api.github.com/';

const api4 = pageDetect.isEnterprise() ?
	`${location.origin}/api/graphql` :
	'https://api.github.com/graphql';

interface GHRestApiOptions {
	ignoreHTTPStatus?: boolean;
	method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
	body?: JsonObject;
	headers?: HeadersInit;
	json?: boolean;
}

interface GHGraphQLApiOptions {
	allowErrors?: boolean;
}

const v3defaults: GHRestApiOptions = {
	ignoreHTTPStatus: false,
	method: 'GET',
	body: undefined,
	json: true
};

const v4defaults: GHGraphQLApiOptions = {
	allowErrors: false
};

export const v3 = mem(async (
	query: string,
	options: GHRestApiOptions = v3defaults
): Promise<RestResponse> => {
	const {ignoreHTTPStatus, method, body, headers, json} = {...v3defaults, ...options};
	const {personalToken} = await settings;

	if (!query.startsWith('https')) {
		query = query.startsWith('/') ? query.slice(1) : ['repos', getRepo()!.nameWithOwner, query].filter(Boolean).join('/');
	}

	const url = new URL(query, api3);
	const response = await fetch(url.href, {
		method,
		body: body && JSON.stringify(body),
		headers: {
			'User-Agent': 'Refined GitHub',
			Accept: 'application/vnd.github.v3+json',
			...headers,
			...personalToken && {Authorization: `token ${personalToken}`}
		}
	});
	const textContent = await response.text();
	const apiResponse = json ? JSON.parse(textContent) : {textContent};

	if (response.ok || ignoreHTTPStatus) {
		return Object.assign(apiResponse, {
			httpStatus: response.status,
			headers: response.headers,
			ok: response.ok
		});
	}

	throw await getError(apiResponse);
}, {
	cacheKey: JSON.stringify
});

export const v3paginated = async function * (
	query: string,
	options?: GHRestApiOptions
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

export const v4 = mem(async (
	query: string,
	options: GHGraphQLApiOptions = v4defaults
): Promise<AnyObject> => {
	const personalToken = await expectToken();

	if (/^(query )?{/.test(query.trimStart())) {
		throw new TypeError('`query` should only be what’s inside \'query {...}\', like \'user(login: "foo") { name }\', but is \n' + query);
	}

	query = query.replace('repository() {', () => `repository(owner: "${getRepo()!.owner}", name: "${getRepo()!.name}") {`);

	const response = await fetch(api4, {
		headers: {
			'User-Agent': 'Refined GitHub',
			Authorization: `bearer ${personalToken}`
		},
		method: 'POST',
		body: JSON.stringify({query: `{${query}}`})
	});

	const apiResponse: GraphQLResponse = await response.json();

	const {
		data = {},
		errors = []
	} = apiResponse;

	if (errors.length > 0 && !options.allowErrors) {
		throw new RefinedGitHubAPIError('GraphQL:', ...errors.map(error => error.message));
	}

	if (response.ok) {
		return data;
	}

	throw await getError(apiResponse as JsonObject);
}, {
	cacheKey: JSON.stringify
});

export async function getError(apiResponse: JsonObject): Promise<RefinedGitHubAPIError> {
	const {personalToken} = await settings;

	if ((apiResponse.message as string)?.includes('API rate limit exceeded')) {
		return new RefinedGitHubAPIError(
			'Rate limit exceeded.',
			personalToken ?
				'It may be time for a walk! 🍃 🌞' :
				'Set your token in the options or take a walk! 🍃 🌞'
		);
	}

	if (apiResponse.message === 'Bad credentials') {
		return new RefinedGitHubAPIError(
			'The token seems to be incorrect or expired. Update it in the options.'
		);
	}

	const error = new RefinedGitHubAPIError(
		'Unable to fetch.',
		personalToken ?
			'Ensure that your token has access to this repo.' :
			'Maybe adding a token in the options will fix this issue.',
		JSON.stringify(apiResponse, null, '\t') // Beautify
	);
	error.response = apiResponse;
	return error;
}
