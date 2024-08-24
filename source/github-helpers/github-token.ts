import {v3} from './api.js';
import {getToken} from '../options-storage.js';

export async function expectToken(): Promise<string> {
	const personalToken = await getToken();
	if (!personalToken) {
		throw new Error('Personal token required for this feature');
	}

	return personalToken;
}

export async function parseTokenScopes(headers: Headers): Promise<string[]> {
	// If `X-OAuth-Scopes` is not present, the token may be not a classic token.
	const scopesHeader = headers.get('X-OAuth-Scopes');
	if (!scopesHeader) {
		return [];
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

export async function expectTokenScope(scope: string): Promise<void> {
	const {headers} = await v3('/');
	const tokenScopes = await parseTokenScopes(headers);
	if (!tokenScopes.includes(scope)) {
		throw new Error('The token you provided does not have ' + (tokenScopes.length > 0 ? `the \`${scope}\` scope. It only includes \`${tokenScopes.join(', ')}\`.` : 'any scope. You can change the scope of your token at https://github.com/settings/tokens'));
	}
}
