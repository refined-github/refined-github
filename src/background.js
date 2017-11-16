import OptionsSync from 'webext-options-sync';
import injectContentScripts from 'webext-dynamic-content-scripts';
import {promisifyChromeAPI as p} from './libs/utils';

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
		try {
			const granted = await p(chrome.permissions.request, {
				origins: [
					`${new URL(url).origin}/*`
				]
			});
			if (granted) {
				if (confirm('Reload this page to apply Refined GitHub?')) {
					chrome.tabs.reload(tabId);
				}
			}
		} catch (err) {
			console.error(err);
			alert(`Error: ${err.message}`);
		}
	}
});
