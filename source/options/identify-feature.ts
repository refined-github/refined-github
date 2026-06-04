import alert from 'webext-alert';
import {isContentScriptRegistered} from 'webext-dynamic-content-scripts/utils.js';
import createContextMenu from 'webext-tools/create-context-menu.js';

import {startFeatureIdentification} from '../helpers/bisect.js';

async function confirmAndReload(_menuInfo: unknown, tab: chrome.tabs.Tab): Promise<void> {
	if (tab.id && tab.url && await isContentScriptRegistered(tab.url)) {
		await startFeatureIdentification(new URL(tab.url).origin);
		await chrome.tabs.reload(tab.id);
	} else {
		await alert('Refined GitHub is not running on this page');
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
