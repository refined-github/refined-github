import OptionsSync from 'webext-options-sync';
import injectContentScripts from 'webext-dynamic-content-scripts';
import browser from 'webextension-polyfill';

// Define defaults
new OptionsSync().define({
	defaults: {
		hideStarsOwnRepos: true
	},
	migrations: [
		OptionsSync.migrations.removeUnused
	]
});

browser.runtime.onMessage.addListener(openAllInTabs);

function openAllInTabs(message) {
	browser.tabs.query({currentWindow: true, active: true}).then(currentTab => {
		message.urls.forEach((url, i) => browser.tabs.create({
			url,
			index: currentTab[0].index + i + 1,
			active: false
		}));
	});
}

// GitHub Enterprise support
injectContentScripts();
