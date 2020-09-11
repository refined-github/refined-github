import 'webext-storage-cache'; // Needed to regularly clear the cache
import 'webext-dynamic-content-scripts';
import addDomainPermissionToggle from 'webext-domain-permission-toggle';
import './options-storage';

browser.runtime.onMessage.addListener((message, {tab}) => {
	if (Array.isArray(message?.openUrls)) {
		for (const [i, url] of (message.openUrls as string[]).entries()) {
			void browser.tabs.create({
				url,
				index: tab!.index + i + 1,
				active: false
			});
		}
	}
});

// Give the browserAction a reason to exist other than "Enable RGH on this domain"
browser.browserAction.onClicked.addListener(() => {
	void browser.tabs.create({
		url: 'https://github.com'
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
			url: 'https://github.com/sindresorhus/refined-github/issues/3543',
			active: false
		});
	}
});

// GitHub Enterprise support
addDomainPermissionToggle();
