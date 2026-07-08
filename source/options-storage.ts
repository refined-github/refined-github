import OptionsSyncPerDomain from 'webext-options-sync-per-domain';

import {importedFeatures, renamedFeatures} from './feature-data.js';

export type RghOptions = typeof defaults;

// eslint-disable-next-line prefer-object-spread -- TypeScript hates this one weird trick
const defaults = Object.assign({
	actionUrl: 'https://github.com/',
	customCss: '',
	personalToken: '',
	logging: false,
	logHttp: false,
	// `extensible-nav` is off by default for now https://github.com/refined-github/refined-github/pull/9594
}, Object.fromEntries(importedFeatures.map(id => [`feature:${id}`, id !== 'extensible-nav'])));

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
	return personalToken;
}

export async function hasToken(): Promise<boolean> {
	return Boolean(await getToken());
}
