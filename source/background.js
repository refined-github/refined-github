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
			options.disabledFeatures = options.disabledFeatures.replace('toggle-all-things-with-alt', ''); // #1524
			options.disabledFeatures = options.disabledFeatures.replace('remove-diff-signs', ''); // #1524
			options.disabledFeatures = options.disabledFeatures.replace('add-confirmation-to-comment-cancellation', ''); // #1524
			options.disabledFeatures = options.disabledFeatures.replace('add-your-repositories-link-to-profile-dropdown', ''); // #1460
			options.disabledFeatures = options.disabledFeatures.replace('add-readme-buttons', 'hide-readme-header'); // #1465
			options.disabledFeatures = options.disabledFeatures.replace('add-delete-to-pr-files', ''); // #1462
			options.disabledFeatures = options.disabledFeatures.replace('auto-load-more-news', 'infinite-scroll'); // #1516
			options.disabledFeatures = options.disabledFeatures.replace('display-issue-suggestions', ''); // #1611
			options.disabledFeatures = options.disabledFeatures.replace('open-all-selected', 'batch-open-issues'); // #1402
			options.disabledFeatures = options.disabledFeatures.replace('copy-file-path', '');
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

	// Nuke old cache
	// TODO: drop code in November
	if (reason === 'update') {
		const dataToPreserve = await browser.storage.local.get('unreadNotifications');
		await browser.storage.local.clear();
		browser.storage.local.set(dataToPreserve);
	}
});

// GitHub Enterprise support
dynamicContentScripts.addToFutureTabs();
domainPermissionToggle.addContextMenu();
