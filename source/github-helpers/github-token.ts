import {CachedFunction} from 'webext-storage-cache';
import * as pageDetect from 'github-url-detection';

// Avoid importing api.js here, there's too much logic/caching we don't need
import {getToken} from '../options-storage.js';
import hashString from '../helpers/hash-string.js';

type BaseApiFetchOptions = {
	apiBase: string;
	token: string;
	path: string;
};

export async function baseApiFetch({apiBase, token, path}: BaseApiFetchOptions): Promise<Response> {
	if (!apiBase.endsWith('/')) {
		throw new TypeError('apiBase must end with a slash');
	}

	const response = await fetch(
		new URL(path, apiBase),
		{
			cache: 'no-store',
			headers: {
				'User-Agent': 'Refined GitHub',
				Accept: 'application/vnd.github.v3+json',
				Authorization: `token ${token}`,
			},
		},
	);

	if (!response.ok) {
		const details = await response.json();
		throw new Error(details.message);
	}

	return response;
}

export const tokenUser = new CachedFunction('token-user', {
	async updater(apiBase: string, token: string): Promise<string> {
		const response = await baseApiFetch({apiBase, token, path: 'user'});
		const details = await response.json();
		return details.login;
	},
	maxAge: {
		// The exact token is forever associated to the user
		days: 365,
	},
	cacheKey: ([apiBase, token]) => hashString(`${apiBase}-${token}`),
});

export async function expectToken(): Promise<string> {
	const token = await getToken();
	if (!token) {
		throw new Error('Personal token required for this feature');
	}

	return token;
}

export async function hasValidGitHubComToken(token?: string): Promise<boolean> {
	token ??= await getToken();
	if (!token) {
		return false;
	}

	try {
		await baseApiFetch({apiBase: 'https://api.github.com/', path: '', token});
		return true;
	} catch {
		return false;
	}
}

function parseTokenScopes(headers: Headers): string[] {
	// If `X-OAuth-Scopes` is not present, the token may be not a classic token.
	const scopesHeader = headers.get('X-OAuth-Scopes');
	if (!scopesHeader) {
		// If the request succeeded but lacked this header, it's likely a fine-grained token
		// https://github.com/orgs/community/discussions/25259#discussioncomment-3247158
		return ['valid_token', 'unknown'];
	}

	const scopes = scopesHeader.split(', ');
	scopes.push('valid_token');
	if (scopes.includes('repo')) {
		scopes.push('public_repo');
	}

	if (scopes.includes('project')) {
		scopes.push('read:project');
	}

	return scopes;
}

type TokenInfo = {
	scopes: string[];
	expiration?: string;
};

export async function getTokenInfo(apiBase: string, personalToken: string): Promise<TokenInfo> {
	const response = await baseApiFetch({apiBase, token: personalToken, path: ''});
	return {
		scopes: parseTokenScopes(response.headers),
		expiration: response.headers.get('GitHub-Authentication-Token-Expiration') ?? undefined,
	};
}

export async function expectTokenScope(scope: string): Promise<void> {
	const token = await expectToken();
	const api = pageDetect.isEnterprise()
		? `${location.origin}/api/v3/`
		: 'https://api.github.com/';

	const {scopes: tokenScopes} = await getTokenInfo(api, token);
	if (!tokenScopes.includes(scope)) {
		throw new Error('The token you provided does not have ' + (tokenScopes.length > 0 ? `the \`${scope}\` scope. It only includes \`${tokenScopes.join(', ')}\`.` : 'any scope. You can change the scope of your token at https://github.com/settings/tokens'));
	}
}
