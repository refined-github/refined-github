import {messageRuntime} from 'webext-msg';

import showToast from '../github-helpers/toast.js';
import pluralize from '../helpers/pluralize.js';

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

/**
 * @warning This function can only be called from a background script.
 */
export async function openTabsFromBackground(urls: string[], {tab}: chrome.runtime.MessageSender): Promise<void> {
	// Reuse container
	// https://github.com/refined-github/refined-github/issues/8657
	const firefoxOnlyProps = tab && 'cookieStoreId' in tab
		? {cookieStoreId: tab.cookieStoreId}
		: {};

	await Promise.all(urls.map((url, index) => {
		return chrome.tabs.create({
			url,
			index: tab!.index + index + 1,
			active: false,
			...firefoxOnlyProps,
		});
	}));
}
