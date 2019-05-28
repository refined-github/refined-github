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

(async () => {
	// Definitions aren't used in the content script
	if (location.protocol.startsWith('http')) {
		return;
	}

	// `options-storage` is run before the rest of the features, so we need to wait for `window.collectFeatures` to be filled
	await Promise.resolve();

	for (const feature of window.collectFeatures.keys()) {
		defaults[`feature:${feature}`] = true;
	}

	options.define({
		defaults,
		migrations: [
			// Drop this migration after June 20
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

			// Removed features will be automatically removed from the options as well, but doesn't run if for some reason the features failed to collect
			window.collectFeatures.size > 90 ?
				OptionsSync.migrations.removeUnused :
				() => {}
		]
	});
})();

export default options;
