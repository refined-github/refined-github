import type {Options} from 'webext-options-sync';

export const tokenOptionPrefix = 'personalToken-';
export type TokenOptionName = `personalToken-${string}`;

export function getTokenOptionName(username: string): TokenOptionName {
	return `${tokenOptionPrefix}${username.toLowerCase()}`;
}

export function isTokenOptionName(name: string): name is TokenOptionName {
	return name.startsWith(tokenOptionPrefix)
		&& name.length > tokenOptionPrefix.length;
}

export function getTokenOptionUsername(name: TokenOptionName): string {
	return name.slice(tokenOptionPrefix.length);
}

export function getTokenOptions(
	options: Options,
): Array<[name: TokenOptionName, token: string]> {
	return Object.entries(options)
		.filter(
			(entry): entry is [TokenOptionName, string] =>
				isTokenOptionName(entry[0])
				&& typeof entry[1] === 'string'
				&& entry[1].length > 0,
		);
}

export function getTokenForUser(
	options: Options & {personalToken?: string},
	username?: string,
): string | undefined {
	if (username) {
		const token = options[getTokenOptionName(username)];
		if (typeof token === 'string' && token.length > 0) {
			return token;
		}

		// Accept keys written before usernames were normalized.
		const normalizedName = getTokenOptionName(username);
		const matchingEntry = getTokenOptions(options)
			.find(([name]) => name.toLowerCase() === normalizedName.toLowerCase());
		if (matchingEntry) {
			return matchingEntry[1];
		}
	}

	if (options.personalToken) {
		return options.personalToken;
	}

	// Extension pages and the background do not expose the logged-in username.
	if (!username) {
		return getTokenOptions(options)[0]?.[1];
	}

	return undefined;
}

export function removeUnusedOptions(options: Options, defaults: Options): void {
	for (const key of Object.keys(options)) {
		if (!Reflect.has(defaults, key) && !isTokenOptionName(key)) {
			Reflect.deleteProperty(options, key);
		}
	}
}
