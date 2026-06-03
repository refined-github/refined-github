import alert from 'webext-alert';
import createContextMenu from 'webext-tools/create-context-menu.js';

import {startFeatureIdentification} from '../helpers/bisect.js';

const reloadPrompt = 'Reload the page to start identification. Reload now?';

async function confirmAndReload(_menuInfo: unknown, tab: chrome.tabs.Tab): Promise<void> {
	await startFeatureIdentification(new URL(tab.url!).origin);

	try {
		await chrome.scripting.executeScript({
			target: {
				tabId: tab.id!,
			},
			func(message) {
				if (confirm(message)) {
					location.reload();
				}
			},
			args: [reloadPrompt],
		});
	} catch {
		await alert('Refined GitHub cannot start identification on this page');
	}
}

export default function addIdentifyFeatureContextMenu(): void {
	void createContextMenu({
		id: 'identify-feature',
		title: 'Identify feature…',
		contexts: ['action'],
		onclick: confirmAndReload,
	});
}
