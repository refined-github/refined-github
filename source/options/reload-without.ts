import {StorageItem} from 'webext-storage';
import webextAlert from 'webext-alert';
import chromeP from 'webext-polyfill-kinda';
import {isScriptableUrl} from 'webext-content-scripts';
import {isFirefox} from 'webext-detect';
import {createContextMenu} from 'webext-tools';

// Always Firefox… https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/StorageArea/setAccessLevel
const area = isFirefox() ? 'local' : 'session';

export const contentScriptToggle = new StorageItem('contentScript', {
	area,
	defaultValue: true,
});

async function reload(_: unknown, tab: chrome.tabs.Tab): Promise<void> {
	if (tab.url && isScriptableUrl(tab.url) && await chromeP.permissions.contains({
		origins: [tab.url],
	})) {
		await contentScriptToggle.set(false);
		chrome.tabs.reload(tab.id!);
	} else {
		// TODO: Use https://github.com/fregante/webext-events/issues/31 to disable the item instead
		webextAlert('Refined GitHub is already not running on this page');
	}
}

export default function addReloadWithoutContentScripts(): void {
	chrome.storage.session.setAccessLevel?.({accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS'});

	void createContextMenu({
		id: 'reload-without-content-scripts',
		title: 'Reload without Refined GitHub',
		contexts: 'action',
		onclick: reload,
	});
}
