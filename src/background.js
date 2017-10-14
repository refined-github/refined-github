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
	const [currentTab] = await browser.tabs.query({currentWindow: true, active: true});
	for (const [url, i] of message.urls.entries()) {
		browser.tabs.create({
			url,
			index: currentTab.index + i + 1,
			active: false
		});
	}
}

// GitHub Enterprise support
injectContentScripts();
