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

import OptionsSync from 'webext-options-sync';

type FetchStrategy = typeof fetch3 | typeof fetch4;

export interface FetchOptions {
	accept404: boolean;
}

export const v3 = (query: string, options?: FetchOptions) => call(fetch3, query, options);
export const v4 = (query: string, options?: FetchOptions) => call(fetch4, query, options);

export const escapeKey = (value: string) => '_' + value.replace(/[./-]/g, '_');

export class RefinedGitHubAPIError extends Error {
	constructor(...messages: string[]) {
		super(messages.join('\n'));
	}
}

const apiv3 = location.hostname === 'github.com' ? 'https://api.github.com/' : `${location.origin}/api/v3`;
const apiv4 = location.hostname === 'github.com' ? 'https://api.github.com/' : `${location.origin}/api/`;
const cache = new Map<string, AnyObject>();

function fetch3(query: string, personalToken: string) {
	
	const headers: HeadersInit = {
		'User-Agent': 'Refined GitHub',
		Accept: 'application/vnd.github.v3+json'
	};
	if (personalToken) {
		headers.Authorization = `token ${personalToken}`;
	}
	
	return fetch(apiv3 + query, {headers});
}

function fetch4(query: string, personalToken: string) {
	if (!personalToken) {
		throw new Error('Personal token required for this feature');
	}

	return fetch(apiv4 + 'graphql', {
		headers: {
			'User-Agent': 'Refined GitHub',
			Authorization: `bearer ${personalToken}`
		},
		method: 'POST',
		body: JSON.stringify({query})
	});
}

// Main function: handles cache, options, errors
async function call(fetch: FetchStrategy, query: string, options: FetchOptions = {accept404: false}) {
	if (cache.has(query)) {
		return cache.get(query);
	}

	const {personalToken} = await new OptionsSync().getAll();
	const response = await fetch(query, personalToken as string);
	const content = await response.text();

	const result: { data?: AnyObject; errors?: Error[]; message?: string;status?: number} = content.length > 0 ? JSON.parse(content) : {status: response.status};
	const {data, errors = [], message = ''} = result;

	if (errors.length > 0) {
		throw Object.assign(
			new RefinedGitHubAPIError('GraphQL:', ...errors.map(e => e.message)),
			result
		);
	}

	if (message.includes('API rate limit exceeded')) {
		throw new RefinedGitHubAPIError(
			'Rate limit exceeded.',
			personalToken ?
				'It may be time for a walk! 🍃 🌞' :
				'Set your token in the options or take a walk! 🍃 🌞'
		);
	}

	if (message === 'Bad credentials') {
		throw new RefinedGitHubAPIError(
			'The token seems to be incorrect or expired. Update it in the options.'
		);
	}

	if (response.ok || (options.accept404 === true && response.status === 404)) {
		const output = fetch === fetch4 ? data : result;
		cache.set(query, output);
		return output;
	}

	throw new RefinedGitHubAPIError(
		'Unable to fetch.',
		personalToken ?
			'Ensure that your token has access to this repo.' :
			'Maybe adding a token in the options will fix this issue.',
		JSON.stringify(result, null, '\t') // Beautify
	);
}
