import * as pageDetect from 'github-url-detection';
import {isWebPage} from 'webext-detect';
import OptionsSyncPerDomain from 'webext-options-sync-per-domain';

import {importedFeatures} from './feature-data.js';
import renamedFeatures from './feature-renames.json' with {type: 'json'};
import {tokenUser} from './github-helpers/github-token.js';

export type RghOptions = typeof defaults;

// eslint-disable-next-line prefer-object-spread -- TypeScript hates this one weird trick
const defaults = Object.assign({
	actionUrl: 'https://github.com/',
	customCss: '',
	personalToken: [''],
	logging: false,
	logHttp: false,
}, Object.fromEntries(importedFeatures.map(id => [`feature:${id}`, true])));

export function isFeatureDisabled(options: RghOptions, id: string): boolean {
	// Must check if it's specifically `false`: It could be undefined if not yet in the readme or if misread from the entry point #6606
	// eslint-disable-next-line unicorn/no-unnecessary-boolean-comparison
	return options[`feature:${id}`] === false;
}

const migrations = [
	(options: RghOptions): void => {
		for (const [from, to] of Object.entries(renamedFeatures)) {
			if (typeof options[`feature:${from}`] === 'boolean') {
				options[`feature:${to}`] = options[`feature:${from}`];
			}
		}
	},

	// TODO [2027-06-01]: Drop
	(options: RghOptions): void => {
		if (typeof options.personalToken === 'string') {
			options.personalToken = [options.personalToken];
		}
	},

	// TODO [2027-01-01]: Drop
	(options: RghOptions): void => {
		if (options.logHTTP) {
			options.logHttp = options.logHTTP;
		}

		if (options.customCSS) {
			options.customCss = options.customCSS as unknown as string;
		}
	},

	// Removed features will be automatically removed from the options as well
	OptionsSyncPerDomain.migrations.removeUnused,
];

export const perDomainOptions = new OptionsSyncPerDomain({defaults, migrations});
const optionsStorage = perDomainOptions.getOptionsForOrigin();
export default optionsStorage;

const cachedSettings = optionsStorage.getAll();

export async function getToken(): Promise<string | undefined> {
	const {personalToken} = await cachedSettings;
	const loggedInUser = pageDetect.utils.getLoggedInUser();
	if (!(loggedInUser && isWebPage())) {
		return personalToken[0];
	}

	const apiBase = pageDetect.isEnterprise() ? `${location.origin}/api/v3/` : 'https://api.github.com/';
	for (const token of personalToken) {
		// eslint-disable-next-line no-await-in-loop -- Tokens are checked in order until a match is found; lookups are cached for a year so it should be instant
		if (token && await tokenUser.get(apiBase, token) === loggedInUser) {
			return token;
		}
	}

	return personalToken[0];
}

export async function hasToken(): Promise<boolean> {
	return Boolean(await getToken());
}
