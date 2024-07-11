import 'webext-dynamic-content-scripts';
import {globalCache} from 'webext-storage-cache'; // Also needed to regularly clear the cache
import {isSafari} from 'webext-detect';
import {addOptionsContextMenu} from 'webext-tools';
import {objectKeys} from 'ts-extras';
import addPermissionToggle from 'webext-permission-toggle';
import webextAlert from 'webext-alert';

import optionsStorage from './options-storage.js';
import isDevelopmentVersion from './helpers/is-development-version.js';
import getStorageBytesInUse from './helpers/used-storage.js';
import {doesBrowserActionOpenOptions} from './helpers/feature-utils.js';
import {styleHotfixes} from './helpers/hotfix.js';

const {version} = chrome.runtime.getManifest();

// GHE support
addPermissionToggle();

// Firefox/Safari polyfill
addOptionsContextMenu();

const messageHandlers = {
	async openUrls(urls: string[], {tab}: chrome.runtime.MessageSender) {
		for (const [index, url] of urls.entries()) {
			void chrome.tabs.create({
				url,
				index: tab!.index + index + 1,
				active: false,
			});
		}
	},
	async closeTab(_: any, {tab}: chrome.runtime.MessageSender) {
		void chrome.tabs.remove(tab!.id!);
	},
	async fetch(url: string) {
		const response = await fetch(url);
		return response.text();
	},
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
	// They must return a promise to mark the message as handled
} satisfies Record<string, (...arguments_: any[]) => Promise<any>>;

chrome.runtime.onMessage.addListener((message: typeof messageHandlers, sender): Promise<unknown> | void => {
	for (const id of objectKeys(message)) {
		if (id in messageHandlers) {
			return messageHandlers[id](message[id], sender);
		}
	}
});

// `browserAction` needed for Firefox MV2 https://github.com/refined-github/refined-github/issues/7477
(chrome.action ?? chrome.browserAction).onClicked.addListener(async tab => {
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

async function hasUsedStorage(): Promise<boolean> {
	return (
		await getStorageBytesInUse('sync') > 0
		|| Number(await getStorageBytesInUse('local')) > 0
	);
}

async function isFirstInstall(suggestedReason: string): Promise<boolean> {
	return (
		// Always exclude local installs from the welcome screen
		!isDevelopmentVersion()

		// Only if the reason is explicitly "install"
		&& suggestedReason === 'install'

		// Safari reports "install" even on updates #5412
		&& !(isSafari() && await hasUsedStorage())
	);
}

chrome.runtime.onInstalled.addListener(async ({reason}) => {
	// Only notify on install
	if (await isFirstInstall(reason)) {
		await chrome.tabs.create({
			url: 'https://github.com/refined-github/refined-github/issues/3543',
		});
	}

	if (isDevelopmentVersion()) {
		await globalCache.clear();
	}

	if (await chrome.permissions.contains({origins: ['*://*/*']})) {
		console.warn('Refined GitHub was granted access to all websites by the user and it’s now been removed. https://github.com/refined-github/refined-github/pull/7407');
		await chrome.permissions.remove({
			origins: [
				'*://*/*',
			],
		});
	}
});

chrome.permissions.onAdded.addListener(async permissions => {
	if (permissions.origins?.includes('*://*/*')) {
		await chrome.permissions.remove({
			origins: [
				'*://*/*',
			],
		});
		await webextAlert('Refined GitHub is not meant to run on every website. If you’re looking to enable it on GitHub Enterprise, follow the instructions in the Options page.');
	}
});

