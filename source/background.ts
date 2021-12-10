import 'webext-dynamic-content-scripts';
import cache from 'webext-storage-cache'; // Also needed to regularly clear the cache
import addDomainPermissionToggle from 'webext-domain-permission-toggle';

import './options-storage';
import {getRghIssueUrl} from './helpers/rgh-issue-link';

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
	for (const id of Object.keys(message) as Array<keyof typeof messageHandlers>) {
		if (id in messageHandlers) {
			return messageHandlers[id](message[id], sender);
		}
	}
});

// Give the browserAction a reason to exist other than "Enable RGH on this domain"
browser.browserAction.onClicked.addListener(() => {
	void browser.tabs.create({
		url: 'https://github.com',
	});
});

browser.runtime.onInstalled.addListener(async ({reason}) => {
	// Only notify on install
	if (reason === 'install') {
		const {installType} = await browser.management.getSelf();
		if (installType === 'development') {
			return;
		}

		await browser.tabs.create({
			url: getRghIssueUrl(3543),
		});
	}

	// Hope that the feature was fixed in this version
	await cache.delete('hotfixes');
	await cache.delete('style-hotfixes');
});
