import OptionsSync from 'webext-options-sync';
import injectContentScripts from 'webext-dynamic-content-scripts';

// Define defaults
new OptionsSync().define({
	defaults: {
		hideStarsOwnRepos: true,
		autoLoadMoreNews: true,

		addReactionParticipants: true,
		showRealNames: true,

		tabSize: 8,

		privateAccessToken: ''
	},
	migrations: [
		OptionsSync.migrations.removeUnused
	]
});

// GitHub Enterprise support
injectContentScripts();
