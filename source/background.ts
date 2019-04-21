import OptionsSync from 'webext-options-sync';
import {addContextMenu} from 'webext-domain-permission-toggle';
import {addToFutureTabs} from 'webext-dynamic-content-scripts';
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
				.replace('make-headers-sticky', '') // #1863
				.replace('jump-to-bottom', '') // #1879
				.replace('hide-readme-header', '') // #1883
				.replace(/commented-menu-item|yours-menu-item/, 'global-discussion-list-filters') // #1883
				.replace('show-recently-pushed-branches-on-more-pages', 'recently-pushed-branches-enhancements') // #1909
				.replace('fix-squash-and-merge-message', '') // #1934
				.replace('fix-squash-and-merge-title', 'pr-merge-info-enhancements') // #1934
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
addToFutureTabs();
addContextMenu();
