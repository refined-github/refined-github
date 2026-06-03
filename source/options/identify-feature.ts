import webextAlert from 'webext-alert';
import createContextMenu from 'webext-tools/create-context-menu.js';

import {startFeatureIdentification} from '../helpers/bisect.js';

const reloadPrompt = 'Reload the page to start identification. Reload now?';

async function confirmAndReload(_: unknown, tab: chrome.tabs.Tab): Promise<void> {
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
	void createContextMenu({
		id: 'identify-feature',
		title: 'Identify feature…',
		contexts: ['action'],
		onclick: confirmAndReload,
	});
}
