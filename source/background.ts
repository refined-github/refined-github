/* global chrome */
import {addContextMenu} from 'webext-domain-permission-toggle';
import './libs/declarative-content-scripts';
import './options-storage';

browser.runtime.onMessage.addListener(async message => {
	if (!message || message.action !== 'openAllInTabs') {
		return;
	}

	const [currentTab] = await browser.tabs.query({currentWindow: true, active: true});
	for (const [i, url] of (message.urls as string[]).entries()) {
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

// Drop in August because we need unregister any previously-registered scripts
if (chrome && chrome.declarativeContent) {
	chrome.declarativeContent.onPageChanged.getRules(globalRules => {
		const moduleIds = globalRules.map(rule => rule.id!).filter(id => id && id.startsWith('webext-content-script-register:'));
		if (moduleIds.length > 0) {
			chrome.declarativeContent.onPageChanged.removeRules(moduleIds);
		}
	});
}
