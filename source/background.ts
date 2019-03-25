import OptionsSync from 'webext-options-sync';
import domainPermissionToggle from 'webext-domain-permission-toggle';
import dynamicContentScripts from 'webext-dynamic-content-scripts';
import './libs/cache';

// Define defaults
new OptionsSync().define({
	defaults: {
		disabledFeatures: '',
		customCSS: '',
		personalToken: '',
		logging: false
	},
	migrations: [
		options => {
			options.disabledFeatures = (options.disabledFeatures as string)
				.replace('milestone-navigation', '') // #1767
				.replace('op-labels', '') // #1776
				.replace('delete-fork-link', '') // #1791
				.replace('exclude-filter-shortcut', '') // #1831
				.replace('diff-view-without-whitespace-option', 'faster-pr-diff-options') // #1799
				.replace('make-headers-sticky', '') // #1863
			; // eslint-disable-line semi-style
		},
		OptionsSync.migrations.removeUnused
	]
});

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
dynamicContentScripts.addToFutureTabs();
domainPermissionToggle.addContextMenu();
