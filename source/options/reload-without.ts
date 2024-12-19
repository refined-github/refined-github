import {StorageItem} from 'webext-storage';
import webextAlert from 'webext-alert';
import chromeP from 'webext-polyfill-kinda';
import {isScriptableUrl} from 'webext-content-scripts';
import {isFirefox} from 'webext-detect';

// Always Firefox… https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/StorageArea/setAccessLevel
const area = isFirefox() ? 'local' : 'session';

export const contentScriptToggle = new StorageItem('contentScript', {
	area,
	defaultValue: true,
});

const id = 'reload-without-content-scripts';

export default function addReloadWithoutContentScripts(): void {
	if (!chrome.contextMenus) {
		// Silently ignore if the API is not available, like in Firefox Android
		// https://github.com/fregante/webext-permission-toggle/pull/53
		return;
	}

	chrome.storage.session.setAccessLevel?.({accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS'});

	chrome.contextMenus.create({
		id,
		title: 'Reload without Refined GitHub',
		contexts: 'action' in chrome ? ['action'] : ['browser_action'],
	});

	chrome.contextMenus.onClicked.addListener(async (info, tab) => {
		if (!tab?.id || info.menuItemId !== id) {
			return;
		}

		if (tab.url && isScriptableUrl(tab.url) && await chromeP.permissions.contains({
			origins: [tab.url],
		})) {
			await contentScriptToggle.set(false);
			chrome.tabs.reload(tab.id);
		} else {
			// TODO: Use https://github.com/fregante/webext-tools/issues/11 to disable the item instead
			webextAlert('Refined GitHub is already not running on this page');
		}
	});
}
