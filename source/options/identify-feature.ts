import alert from 'webext-alert';
import createContextMenu from 'webext-tools/create-context-menu.js';

import {startFeatureIdentification} from '../helpers/bisect.js';

async function confirmAndReload(_menuInfo: unknown, tab: chrome.tabs.Tab): Promise<void> {
	try {
		await startFeatureIdentification(new URL(tab.url!).origin);
		await chrome.tabs.reload(tab.id!);
	} catch {
		await alert('Refined GitHub cannot start identification on this page');
	}
}

export default function addIdentifyFeatureContextMenu(): void {
	void createContextMenu({
		id: 'identify-feature',
		title: 'Reload page and identify feature…',
		contexts: ['action'],
		onclick: confirmAndReload,
	});
}
