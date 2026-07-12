// eslint-disable-next-line import-x/no-unassigned-import -- Side effects
import 'webext-dynamic-content-scripts';
// eslint-disable-next-line import-x/no-unassigned-import -- Side effects
import 'webext-bugs/options-menu-item';
import {customizeNoAllUrlsErrorMessage} from 'webext-bugs/no-all-urls';
import {isSafari} from 'webext-detect';
import {handleMessages} from 'webext-msg';
import addPermissionToggle from 'webext-permission-toggle';
import {StorageItem} from 'webext-storage';
import {globalCache} from 'webext-storage-cache'; // Also needed to regularly clear the cache

import {doesBrowserActionOpenOptions} from './helpers/feature-utils.js';
import {styleHotfixes} from './helpers/hotfix.js';
import isDevelopmentVersion from './helpers/is-development-version.js';
import {fetchText} from './helpers/isomorphic-fetch.js';
import safeCreateTab from './helpers/safe-create-tab.js';
import optionsStorage, {hasToken} from './options-storage.js';
import addIdentifyFeatureContextMenu from './options/identify-feature.js';
import addReloadWithoutContentScripts from './options/reload-without.js';

const {version} = chrome.runtime.getManifest();

const welcomeShown = new StorageItem('welcomed', {defaultValue: false});

// GHE support
if (!isSafari()) {
	addPermissionToggle();
}

// Add "Reload without content scripts" functionality
addReloadWithoutContentScripts();
addIdentifyFeatureContextMenu();

// Extend the error message for the "No All URLs" bugfix
customizeNoAllUrlsErrorMessage(
	'Refined GitHub is not meant to run on every website. If you’re looking to enable it on GitHub Enterprise, follow the instructions in the Options page.',
);

handleMessages({
	async ping(): Promise<string> {
		return 'pong';
	},
	async openUrls(urls: string[], {tab}: chrome.runtime.MessageSender) {
		for (const url of urls) {
			void safeCreateTab({
				url,
				openerTabId: tab!.id,
				active: false,
			});
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
		return safeCreateTab({
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

	await safeCreateTab({
		openerTabId: tab.id,
		url: actionUrl,
	});
});

async function showWelcomePage(): Promise<void> {
	if (await welcomeShown.get()) {
		return;
	}

	const [hasStoredToken, hasPermissions] = await Promise.all([
		hasToken(), // We can't handle an invalid token on a "Welcome" page, so just check whether the user has ever set one
		chrome.permissions.contains({origins: ['https://github.com/*']}),
	]);

	try {
		if (hasStoredToken && hasPermissions) {
			// Mark as welcomed
			return;
		}

		const url = chrome.runtime.getURL('assets/welcome.html');
		await safeCreateTab({url});
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
