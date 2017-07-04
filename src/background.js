import OptionsSync from 'webext-options-sync';
import injectContentScripts from 'webext-dynamic-content-scripts';

// Define defaults
new OptionsSync().define({
	defaults: {
		hideStarsOwnRepos: true,
		overrideFonts: true
	},
	migrations: [
		OptionsSync.migrations.removeUnused
	]
});

// GitHub Enterprise support
injectContentScripts();
