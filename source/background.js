import OptionsSync from 'webext-options-sync';
import domainPermissionToggle from 'webext-domain-permission-toggle';
import dynamicContentScripts from 'webext-dynamic-content-scripts';

// Define defaults
new OptionsSync().define({
	defaults: {
		disabledFeatures: '',
		logging: false
	},
	migrations: [
		options => {
			// #877
			if (options.hideStarsOwnRepos === false) {
				options.disabledFeatures += '\nhide-own-stars';
			}

			// #920
			options.disabledFeatures = options.disabledFeatures.replace('linkify_branch_refs', 'linkify-branch-refs');
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

// GitHub Enterprise support
dynamicContentScripts.addToFutureTabs();
domainPermissionToggle.addContextMenu();
