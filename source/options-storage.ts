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
}, Object.fromEntries(importedFeatures.map(id => [`feature:${id}`, true])));

export function isFeatureDisabled(options: RghOptions, id: string): boolean {
	// Must check if it's specifically `false`: It could be undefined if not yet in the readme or if misread from the entry point #6606
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
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

	// TODO: Drop in 2027
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
