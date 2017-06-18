import OptSync from 'webext-options-sync';
import injectContentScripts from 'webext-dynamic-content-scripts';

// Define defaults
new OptSync().define({
	defaults: {
		hideStarsOwnRepos: true
	},
	migrations: [
		OptSync.migrations.removeUnused
	]
});

// GitHub Enterprise support
injectContentScripts();
