import {isMobileFirefox} from 'webext-detect';

export default async function safeCreateTab(properties: chrome.tabs.CreateProperties): Promise<chrome.tabs.Tab> {
	// No support there https://stackoverflow.com/a/42422254
	if (properties.openerTabId && isMobileFirefox()) {
		delete properties.openerTabId;
	}

	// eslint-disable-next-line byo/prefer-safe-create-tab -- Rule points to this function
	return chrome.tabs.create(properties);
}
