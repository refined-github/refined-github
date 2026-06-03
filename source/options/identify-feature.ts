import webextAlert from 'webext-alert';

import {startFeatureIdentification} from '../helpers/bisect.js';

const reloadPrompt = 'Reload the page to start identification. Reload now?';
const menuId = 'identify-feature';

async function confirmAndReload(_menuInfo: unknown, tab: chrome.tabs.Tab): Promise<void> {
	if (!tab.id || !tab.url) {
		return;
	}

	try {
		const [{result: shouldReload = false} = {}] = await chrome.scripting.executeScript({
			target: {
				tabId: tab.id,
			},
			func: message => globalThis.confirm(message),
			args: [reloadPrompt],
		});

		if (!shouldReload) {
			return;
		}
	} catch {
		await webextAlert('Refined GitHub cannot start identification on this page');
		return;
	}

	await startFeatureIdentification(new URL(tab.url).origin);
	await chrome.tabs.reload(tab.id);
}

export default function addIdentifyFeatureContextMenu(): void {
	chrome.contextMenus.onClicked.addListener((info, tab) => {
		if (info.menuItemId === menuId) {
			void confirmAndReload(info, tab);
		}
	});

	void chrome.contextMenus.update(menuId, {
		title: 'Identify feature…',
		contexts: ['action'],
	}).catch(() => {});

	void chrome.contextMenus.create({
		id: menuId,
		title: 'Identify feature…',
		contexts: ['action'],
	}).catch(() => {});
}
