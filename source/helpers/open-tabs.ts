import {isMobileFirefox} from 'webext-detect';
import {messageRuntime} from 'webext-msg';

import showToast from '../github-helpers/toast.js';
import pluralize from './pluralize.js';

export default async function openTabs(urls: string[]): Promise<boolean> {
	if (urls.length >= 10 && !confirm(`This will open ${urls.length} new tabs. Continue?`)) {
		return false;
	}

	const response = messageRuntime({
		openUrls: urls,
	});

	await showToast(response, {
		message: 'Opening…',
		doneMessage: pluralize(urls.length, '$$ tab') + ' opened',
	});

	return true;
}

export async function safeCreateTab(properties: chrome.tabs.CreateProperties): Promise<chrome.tabs.Tab> {
	// No support there https://stackoverflow.com/a/42422254
	if (properties.openerTabId && isMobileFirefox()) {
		delete properties.openerTabId;
	}

	// eslint-disable-next-line byo/prefer-safe-create-tab -- Rule points to this function
	return chrome.tabs.create(properties);
}
