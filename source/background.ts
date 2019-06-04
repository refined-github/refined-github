import {addContextMenu} from 'webext-domain-permission-toggle';
import './libs/content-scripts-register-polyfill';
import './libs/cache';
import './options-storage';

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

// Give the browserAction a reason to exist other than "Enable RGH on this domain"
browser.browserAction.onClicked.addListener(() => {
	browser.tabs.create({
		url: 'https://github.com'
	});
});

browser.runtime.onInstalled.addListener(async ({reason}) => {
	// Only notify on install
	if (reason === 'install') {
		const self = await browser.management.getSelf();
		if (self && self.installType === 'development') {
			return;
		}

		browser.tabs.create({
			url: 'https://github.com/sindresorhus/refined-github/issues/1137',
			active: false
		});
	}
});

// GitHub Enterprise support
addContextMenu();

// @ts-ignore
chrome.permissions.onAdded.addListener(({origins}: {origins: string[]}) => {
	console.log(origins)
	if (origins.length === 0) {
		return;
	}

	const configs = browser.runtime.getManifest().content_scripts!;
	for (const config of configs) {
		console.log({
			js: (config.js || []).map(file => ({ file })),
			css: (config.css || []).map(file => ({ file })),
			allFrames: config.all_frames,
			matches: origins,
			runAt: config.run_at
		})

		// @ts-ignore
		chrome.contentScripts.register({
			js: (config.js || []).map(file => ({ file })),
			css: (config.css || []).map(file => ({ file })),
			allFrames: config.all_frames,
			matches: origins,
			runAt: config.run_at
		});
	}
})
