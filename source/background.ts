import 'webext-dynamic-content-scripts';
import 'webext-bugs/options-menu-item';
import {customizeNoAllUrlsErrorMessage} from 'webext-bugs/no-all-urls';
import {globalCache} from 'webext-storage-cache'; // Also needed to regularly clear the cache
import addPermissionToggle from 'webext-permission-toggle';
import {StorageItem} from 'webext-storage';
import {handleMessages} from 'webext-msg';
import {isSafari} from 'webext-detect';

import optionsStorage, {hasToken} from './options-storage.js';
import isDevelopmentVersion from './helpers/is-development-version.js';
import {doesBrowserActionOpenOptions} from './helpers/feature-utils.js';
import {styleHotfixes} from './helpers/hotfix.js';
import {fetchText} from './helpers/isomorphic-fetch.js';
import addReloadWithoutContentScripts from './options/reload-without.js';

const {version, permissions} = chrome.runtime.getManifest();

const welcomeShown = new StorageItem('welcomed', {defaultValue: false});

// GHE support
if (!isSafari()) {
	addPermissionToggle();
}

// Add "Reload without content scripts" functionality
addReloadWithoutContentScripts();

// Extend the error message for the "No All URLs" bugfix
customizeNoAllUrlsErrorMessage('Refined GitHub is not meant to run on every website. If you’re looking to enable it on GitHub Enterprise, follow the instructions in the Options page.');

handleMessages({
	async openUrls(urls: string[], {tab}: chrome.runtime.MessageSender) {
		// Reuse container
		// TODO: https://github.com/refined-github/refined-github/issues/8657
		// Soft-disabled via `cookies` permission check: https://github.com/refined-github/refined-github/pull/8786#pullrequestreview-3491531965
		const firefoxOnlyProps = tab && 'cookieStoreId' in tab && permissions!.includes('cookies')
			? {cookieStoreId: tab.cookieStoreId}
			: {};

		for (const [index, url] of urls.entries()) {
			void chrome.tabs.create({
				url,
				index: tab!.index + index + 1,
				active: false,
				...firefoxOnlyProps,
			});
		}
	},
	async closeTab(_: any, {tab}: chrome.runtime.MessageSender) {
		void chrome.tabs.remove(tab!.id!);
	},
	fetchText,
	async fetchJSON(url: string) {
		const response = await fetch(url);
		return response.json();
	},
	async openOptionsPage() {
		return chrome.runtime.openOptionsPage();
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
