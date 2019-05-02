/*
These will throw `RefinedGitHubAPIError` if something goes wrong or if it's a 404.
Probably don't catch them so they will appear in the console
next to the name of the feature that caused them.

Usage:

import * as api from '../libs/api';
const user  = await api.v3(`users/${username}`);
const data = await api.v4('{user(login: "user") {name}}');

Returns:
a Promise that resolves into an object.

If the response body is empty, you'll receive an object like {status: 200}

The second argument is an options object,
it lets you define accept a 404 error code as a valid response, like:

{
	accept404: true
}

so the call will not throw an error but it will return as usual.
 */

import pMemoize from 'p-memoize';
import OptionsSync from 'webext-options-sync';
import {JsonObject} from 'type-fest';

type JsonError = {
	message: string;
}

interface APIResponse {
	message?: string;
}

interface GraphQLResponse extends APIResponse {
	data?: JsonObject;
	errors?: JsonError[];
}

export interface GHRestApiOptions {
	accept404: boolean;
}

export const escapeKey = (value: string): string => '_' + value.replace(/[ ./-]/g, '_');

export class RefinedGitHubAPIError extends Error {
	constructor(...messages: string[]) {
		super(messages.join('\n'));
	}
}

const settings = new OptionsSync().getAll();

const api3 = location.hostname === 'github.com' ?
	'https://api.github.com/' :
	`${location.origin}/api/v3/`;
const api4 = location.hostname === 'github.com' ?
	'https://api.github.com/graphql' :
	`${location.origin}/api/graphql`;

export const v3 = pMemoize(async (
	query: string,
	options: GHRestApiOptions = {accept404: false}
): Promise<AnyObject> => {
	const {personalToken} = await settings;

	const response = await fetch(api3 + query, {
		headers: {
			'User-Agent': 'Refined GitHub',
			Accept: 'application/vnd.github.v3+json',
			...(personalToken ? {Authorization: `token ${personalToken}`} : {})
		}
	});
	const textContent = await response.text();

	// The response might just be a 200 or 404, it's the REST equivalent of `boolean`
	const apiResponse: JsonObject = textContent.length > 0 ? JSON.parse(textContent) : {status: response.status};

	if (response.ok || (options.accept404 === true && response.status === 404)) {
		return apiResponse;
	}

	throw getError(apiResponse);
});

export const v4 = pMemoize(async (query: string): Promise<AnyObject> => {
	const {personalToken} = await settings;

	if (!personalToken) {
		throw new Error('Personal token required for this feature');
	}

	const response = await fetch(api4, {
		headers: {
			'User-Agent': 'Refined GitHub',
			Authorization: `bearer ${personalToken}`
		},
		method: 'POST',
		body: JSON.stringify({query})
	});

	const apiResponse: GraphQLResponse = await response.json();

	const {
		data = {},
		errors = []
	} = apiResponse;

	if (errors.length > 0) {
		throw Object.assign(
			new RefinedGitHubAPIError('GraphQL:', ...errors.map(error => error.message)),
			apiResponse
		);
	}

	if (response.ok) {
		return data;
	}

	throw getError(apiResponse as JsonObject);
});

async function getError(apiResponse: JsonObject): Promise<RefinedGitHubAPIError> {
	const {personalToken} = await settings;

	if (typeof apiResponse.message === 'string' && apiResponse.message.includes('API rate limit exceeded')) {
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

	return new RefinedGitHubAPIError(
		'Unable to fetch.',
		personalToken ?
			'Ensure that your token has access to this repo.' :
			'Maybe adding a token in the options will fix this issue.',
		JSON.stringify(apiResponse, null, '\t') // Beautify
	);
}
