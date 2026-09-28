import {getTokenInfo, tokenUser} from '../github-helpers/github-token.js';

export type TokenValidation = {user: string; message: string; scopes?: string[]};

export class TokenExpiredError extends Error {
	constructor() {
		super('Token expired');
	}
}

const rtf = new Intl.RelativeTimeFormat('en', {numeric: 'auto'});

export function getApiUrl(host?: string): string {
	return !host || host === 'github.com'
		? 'https://api.github.com/'
		: `https://${host}/api/v3/`;
}

export async function checkToken(
	apiUrl: string,
	token: string,
): Promise<TokenValidation> {
	if (token.length < 40) {
		throw new Error('Token is too short');
	}

	const [tokenInfo, user] = await Promise.all([
		getTokenInfo(apiUrl, token),
		tokenUser.get(apiUrl, token),
	]);

	if (
		tokenInfo.expiration
		&& new Date(tokenInfo.expiration).getTime() < Date.now()
	) {
		throw new TokenExpiredError();
	}

	// Build status message with user and expiration
	let message = `👤 @${user}`;
	if (tokenInfo.expiration) {
		const msUntilExpiration = new Date(tokenInfo.expiration).getTime()
			- Date.now();
		const daysUntilExpiration = Math.ceil(
			msUntilExpiration / (1000 * 60 * 60 * 24),
		);
		message += `, expires ${rtf.format(daysUntilExpiration, 'day')}`;
	}

	return {user, message, scopes: tokenInfo.scopes};
}
