import OptionsSync from 'webext-options-sync';

export interface Options {
	customCSS: string;
	personalToken: string;
	logging: boolean;
	[featureName: string]: string | boolean;
}

const defaults: Options = {
	customCSS: '',
	personalToken: '',
	logging: false
};

function featureWasRenamed(from: string, to: string): any { // TODO: any should probably be `Migration` after `webext-options-sync`'s types are fixed
	return (options: Options) => {
		if (typeof options[`feature:${from}`] === 'boolean') {
			options[`feature:${to}`] = options[`feature:${from}`];
		}
	};
}

const options = new OptionsSync();

// This file maybe be included twice, (#2098) but we don't need the migrations to run more than once
let migrationsRun = false;

// Definitions aren't used in the content script
if (!location.protocol.startsWith('http') && !migrationsRun) {
	migrationsRun = true;

	// This variable is replaced at build time with the list
	// eslint-disable-next-line no-undef
	for (const feature of __featuresList__) {
		defaults[`feature:${feature}`] = true;
	}

	options.define({
		defaults,
		migrations: [
			// Drop this migration after July
			options => {
				if (typeof options.disabledFeatures !== 'string') {
					return;
				}

				for (const feature of options.disabledFeatures.split(/\s+/)) {
					options[`feature:${feature}`] = false;
				}
			},

			// Example to for renamed features:
			featureWasRenamed('fix-squash-and-merge-title', 'sync-pr-commit-title'), // Merged on April 22

			// Removed features will be automatically removed from the options as well
			OptionsSync.migrations.removeUnused
		]
	});
}

export default options;
