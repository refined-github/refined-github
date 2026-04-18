import {StorageItem} from 'webext-storage';
import webextAlert from 'webext-alert';
import {isScriptableUrl} from 'webext-content-scripts';
import {createContextMenu} from 'webext-tools';

// Always Firefox… https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/storage/StorageArea/setAccessLevel
// Don't use `isFirefox` - #9065
const area =
	chrome.storage.session?.setAccessLevel === undefined ? 'local' : 'session';

export const contentScriptToggle = new StorageItem('contentScript', {
	area,
	defaultValue: true,
});

async function reload(_: unknown, tab: chrome.tabs.Tab): Promise<void> {
	if (
		tab.url &&
		isScriptableUrl(tab.url) &&
		(await chrome.permissions.contains({
			origins: [tab.url],
		}))
	) {
		await contentScriptToggle.set(false);
		await chrome.tabs.reload(tab.id!);
	} else {
		// TODO: Use https://github.com/fregante/webext-events/issues/31 to disable the item instead
		await webextAlert('Refined GitHub is already not running on this page');
	}
}

export default function addReloadWithoutContentScripts(): void {
	void chrome.storage.session.setAccessLevel?.({
		accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS',
	});

	void createContextMenu({
		id: 'reload-without-content-scripts',
		title: 'Reload without Refined GitHub',
		contexts: ['action'],
		onclick: reload,
	});
}
