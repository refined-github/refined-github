import OptionsSync from 'webext-options-sync';

export interface RGHOptions {
	customCSS: string;
	personalToken: string;
	logging: boolean;
	[featureName: string]: string | boolean;
}

function featureWasRenamed(from: string, to: string): any { // TODO: any should probably be `Migration` after `webext-options-sync`'s types are fixed
	return (options: RGHOptions) => {
		if (typeof options[`feature:${from}`] === 'boolean') {
			options[`feature:${to}`] = options[`feature:${from}`];
		}
	};
}

// This variable is replaced at build time with the list
const featureOptions: Partial<RGHOptions> = {};
for (const feature of __featuresList__) {
	featureOptions[`feature:${feature}`] = true;
}

export default new OptionsSync({
	// eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
	defaults: {
		customCSS: '',
		personalToken: '',
		logging: false,
		...featureOptions
	} as RGHOptions,
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

		featureWasRenamed('move-marketplace-link-to-profile-dropdown', 'deprioritize-marketplace-link'), // Merged on June 7th
		featureWasRenamed('show-asset-download-count', 'release-download-count'), // Merged on June 9th

		// Removed features will be automatically removed from the options as well
		OptionsSync.migrations.removeUnused
	]
});
