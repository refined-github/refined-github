import OptionsSync from 'webext-options-sync';
import domainPermissionToggle from 'webext-domain-permission-toggle';
import dynamicContentScripts from 'webext-dynamic-content-scripts';

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
			options.disabledFeatures = options.disabledFeatures.replace('move-account-switcher-to-sidebar', ''); // #1330
			options.disabledFeatures = options.disabledFeatures.replace('add-your-repositories-link-to-profile-dropdown', ''); // #1460
			options.disabledFeatures = options.disabledFeatures.replace('add-readme-buttons', 'hide-readme-header'); // #1465
			options.disabledFeatures = options.disabledFeatures.replace('add-delete-to-pr-files', ''); // #1462
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

browser.runtime.onInstalled.addListener(async ({reason}) => {
	// Cleanup old key
	// TODO: remove in the future
	browser.storage.local.remove('userWasNotified');

	// Only notify on install
	if (reason === 'install') {
		const {installType} = await browser.management.getSelf();
		if (installType === 'development') {
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
