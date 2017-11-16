import OptionsSync from 'webext-options-sync';
import injectContentScripts from 'webext-dynamic-content-scripts';

// Define defaults
new OptionsSync().define({
	defaults: {
		hideStarsOwnRepos: true
	},
	migrations: [
		OptionsSync.migrations.removeUnused
	]
});

browser.runtime.onMessage.addListener(async message => {
	if (!message || message.action !== 'openAllInTabs') {
		return;
	}
	const [currentTab] = await browser.tabs.query({currentWindow: true, active: true});
	for (const [i, url] of message.urls.entries()) {
		browser.tabs.create({
			url,
			index: currentTab.index + i + 1,
			active: false
		});
	}
});

// GitHub Enterprise support
injectContentScripts();

browser.contextMenus.create({
	id: 'enable-extension-on-new-domain',
	title: 'Enable Refined GitHub on this domain',
	contexts: ['page_action'],
	documentUrlPatterns: [
		'http://*/*',
		'https://*/*'
	]
});

browser.contextMenus.onClicked.addListener(async ({menuItemId}, {tabId, url}) => {
	/* eslint-disable no-alert */
	/* global chrome */
	if (menuItemId === 'enable-extension-on-new-domain') {
		chrome.permissions.request({
			origins: [
				`${new URL(url).origin}/*`
			]
		}, granted => {
			if (chrome.runtime.lastError) {
				alert(`Error: ${chrome.runtime.lastError.message}`);
			} else if (granted && confirm('Do you want to reload this page to apply Refined GitHub?')) {
				chrome.tabs.reload(tabId);
			}
		});
	}
});
