import 'webext-dynamic-content-scripts';
import cache from 'webext-storage-cache'; // Also needed to regularly clear the cache
import {isSafari} from 'webext-detect-page';
import {objectKeys} from 'ts-extras';
import addDomainPermissionToggle from 'webext-domain-permission-toggle';

import optionsStorage from './options-storage';
import {getRghIssueUrl} from './helpers/rgh-issue-link';
import isDevelopmentVersion from './helpers/is-development-version';

// GHE support
addDomainPermissionToggle();

const messageHandlers = {
	openUrls(urls: string[], {tab}: browser.runtime.MessageSender) {
		for (const [i, url] of urls.entries()) {
			void browser.tabs.create({
				url,
				index: tab!.index + i + 1,
				active: false,
			});
		}
	},
	closeTab(_: any, {tab}: browser.runtime.MessageSender) {
		void browser.tabs.remove(tab!.id!);
	},
	async fetch(url: string) {
		const response = await fetch(url);
		return response.text();
	},
	async fetchJSON(url: string) {
		const response = await fetch(url);
		return response.json();
	},
	openOptionsPage() {
		void browser.runtime.openOptionsPage();
	},
};

browser.runtime.onMessage.addListener((message: typeof messageHandlers, sender) => {
	for (const id of objectKeys(message)) {
		if (id in messageHandlers) {
			return messageHandlers[id](message[id], sender);
		}
	}
});

browser.browserAction.onClicked.addListener(async tab => {
	const {actionUrl} = await optionsStorage.getAll();
	void browser.tabs.create({
		openerTabId: tab.id,
		url: actionUrl || 'https://github.com',
	});
});

async function hasUsedStorage(): Promise<boolean> {
	return (
		await browser.storage.sync.getBytesInUse() > 0
		// Note: Not available in Firefox https://bugzilla.mozilla.org/show_bug.cgi?id=1385832
		|| Number(await browser.storage.local.getBytesInUse?.()) > 0
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

browser.runtime.onInstalled.addListener(async ({reason}) => {
	// Only notify on install
	if (await isFirstInstall(reason)) {
		await browser.tabs.create({
			url: getRghIssueUrl(3543),
		});
	}

	// Hope that the feature was fixed in this version
	await cache.delete('hotfixes:');
	await cache.delete('style-hotfixes:');
});
