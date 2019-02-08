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
				.replace('display-issue-suggestions', '') // #1611
				.replace('open-all-selected', 'batch-open-issues') // #1402
				.replace('copy-file-path', '') // #1628
				.replace('bypass-checks-travis', 'bypass-checks') // #1693
				.replace(/^add-(.+)-to-(profile|comments|comment-fields|emojis)$/, '$2-$1') // #1719
				.replace(/^add-/, ''); // #1719
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
});

// GitHub Enterprise support
dynamicContentScripts.addToFutureTabs();
domainPermissionToggle.addContextMenu();
