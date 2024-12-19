import {StorageItem} from 'webext-storage';

export const contentScript = new StorageItem('contentScript', {
	area: 'session',
	defaultValue: true,
});

export default function addReloadWithoutContentScripts(): void {
	chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });

	chrome.contextMenus.create({
		id: 'reload-without-content-scripts',
		title: 'Reload without Refined GitHub',
		contexts: ['action'],
	});
	chrome.contextMenus.onClicked.addListener(async (info, tab) => {
		if (info.menuItemId === 'reload-without-content-scripts' && tab?.id) {
			await contentScript.set(false);
			chrome.tabs.reload(tab.id);
		}
	});
}
