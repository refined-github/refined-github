import OptionsSyncPerDomain from 'webext-options-sync-per-domain';

import renamedFeatures from './feature-renames.json';
import {importedFeatures} from '../readme.md';

export type RGHOptions = typeof defaults;

const defaults = Object.assign({
	actionUrl: 'https://github.com/',
	customCSS: '',
	personalToken: '',
	logging: false,
	logHTTP: false,
}, Object.fromEntries(importedFeatures.map(id => [`feature:${id}`, true])));

export function isFeatureDisabled(options: RGHOptions, id: string): boolean {
	// Must check if it's specifically `false`: It could be undefined if not yet in the readme or if misread from the entry point #6606
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
	return options[`feature:${id}`] === false;
}

export function getNewFeatureName(possibleFeatureName: string): FeatureID | undefined {
	// @ts-expect-error Useless "no index type" error as usual
	const newFeatureName = renamedFeatures[possibleFeatureName] as FeatureID ?? possibleFeatureName;
	return importedFeatures.includes(newFeatureName) ? newFeatureName : undefined;
}

const migrations = [
	(options: RGHOptions): void => {
		for (const [from, to] of Object.entries(renamedFeatures)) {
			if (typeof options[`feature:${from}`] === 'boolean') {
				options[`feature:${to}`] = options[`feature:${from}`];
			}
		}
	},

	// Removed features will be automatically removed from the options as well
	OptionsSyncPerDomain.migrations.removeUnused,
];

export const perDomainOptions = new OptionsSyncPerDomain({defaults, migrations});
export default perDomainOptions.getOptionsForOrigin();
