import 'webext-dynamic-content-scripts';
import cache from 'webext-storage-cache'; // Also needed to regularly clear the cache
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

	// Hope that the feature was fixed in this version
	await cache.delete('hotfix');
});

// GitHub Enterprise support
addDomainPermissionToggle();

// `background` fetch required to avoid avoid CORB introduced in Chrome 73 https://chromestatus.com/feature/5629709824032768
// Don’t turn this into an `async` function https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage#addListener_syntax
browser.runtime.onMessage.addListener(({request}): Promise<Response> | void => {
	return fetch(request).then(async response => response.json());
});
