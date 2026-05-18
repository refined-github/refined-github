import 'webext-dynamic-content-scripts';
import 'webext-bugs/options-menu-item';
import {customizeNoAllUrlsErrorMessage} from 'webext-bugs/no-all-urls';
import {isFirefox, isSafari} from 'webext-detect';
import {handleMessages} from 'webext-msg';
import addPermissionToggle from 'webext-permission-toggle';
import {StorageItem} from 'webext-storage';
import {globalCache} from 'webext-storage-cache'; // Also needed to regularly clear the cache

import {doesBrowserActionOpenOptions} from './helpers/feature-utils.js';
import {styleHotfixes} from './helpers/hotfix.js';
import isDevelopmentVersion from './helpers/is-development-version.js';
import {fetchText} from './helpers/isomorphic-fetch.js';
import optionsStorage, {hasToken} from './options-storage.js';
import addReloadWithoutContentScripts from './options/reload-without.js';

const {version} = chrome.runtime.getManifest();

const welcomeShown = new StorageItem('welcomed', {defaultValue: false});

// GHE support
if (!isSafari()) {
	addPermissionToggle();
}

// Add "Reload without content scripts" functionality
addReloadWithoutContentScripts();

// Extend the error message for the "No All URLs" bugfix
customizeNoAllUrlsErrorMessage(
	'Refined GitHub is not meant to run on every website. If you’re looking to enable it on GitHub Enterprise, follow the instructions in the Options page.',
);

async function createInactiveTab(url: string, tab: chrome.tabs.Tab, index: number): Promise<chrome.tabs.Tab | void> {
	if (isFirefox()) {
		if (tab.id === undefined) {
			return;
		}

		const duplicatedTab = await chrome.tabs.duplicate(tab.id);
		if (duplicatedTab?.id === undefined) {
			return;
		}

		await chrome.tabs.move(duplicatedTab.id, {index: tab.index + index + 1});
		return chrome.tabs.update(duplicatedTab.id, {url, active: false});
	}

	return chrome.tabs.create({
		url,
		index: tab.index + index + 1,
		active: false,
	});
}

handleMessages({
	async openUrls(urls: string[], {tab}: chrome.runtime.MessageSender) {
		if (!tab) {
			return;
		}

		for (const [index, url] of urls.entries()) {
			void createInactiveTab(url, tab, index);
		}
	},
	async closeTab(_: any, {tab}: chrome.runtime.MessageSender) {
		void chrome.tabs.remove(tab!.id!);
	},
	fetchText,
	async fetchJson(url: string) {
		const response = await fetch(url);
		return response.json();
	},
	async openOptionsPage(hash: string) {
		return chrome.tabs.create({
			url: chrome.runtime.getURL(`assets/options.html${hash && `#${hash}`}`),
		});
	},
	async getStyleHotfixes() {
		return styleHotfixes.get(version);
	},
});

chrome.action.onClicked.addListener(async tab => {
	if (doesBrowserActionOpenOptions) {
		void chrome.runtime.openOptionsPage();
		return;
	}

	const {actionUrl} = await optionsStorage.getAll();
	if (!actionUrl) {
		// Default to options page if unset
		void chrome.runtime.openOptionsPage();
		return;
	}

	await chrome.tabs.create({
		openerTabId: tab.id,
		url: actionUrl,
	});
});

async function showWelcomePage(): Promise<void> {
	if (await welcomeShown.get()) {
		return;
	}

	const [token, permissions] = await Promise.all([
		hasToken(), // We can't handle an invalid token on a "Welcome" page, so just check whether the user has ever set one
		chrome.permissions.contains({origins: ['https://github.com/*']}),
	]);

	try {
		if (token && permissions) {
			// Mark as welcomed
			return;
		}

		const url = chrome.runtime.getURL('assets/welcome.html');
		await chrome.tabs.create({url});
	} finally {
		// Make sure it's always set to true even in case of errors
		await welcomeShown.set(true);
	}
}

chrome.runtime.onInstalled.addListener(async () => {
	if (isDevelopmentVersion()) {
		await globalCache.clear();
	}

	// Call after the reset above just in case we nuked Safari's base permissions
	await showWelcomePage();
});
