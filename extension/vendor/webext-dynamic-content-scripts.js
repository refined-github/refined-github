// https://github.com/bfred-it/webext-dynamic-content-scripts 1.2.1

var injectContentScripts = (function () {
'use strict';

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var webextContentScriptPing = createCommonjsModule(function (module, exports) {
// https://github.com/bfred-it/webext-content-script-ping

function pingContentScript(tabId) {
	return new Promise((resolve, reject) => {
		setTimeout(reject, 300);
		chrome.tabs.sendMessage(tabId, chrome.runtime.id, {
			// Only the main frame is necessary;
			// if that isn't loaded, no other iframe is
			frameId: 0
		}, response => {
			if (response === chrome.runtime.id) {
				resolve();
			} else {
				reject();
			}
		});
	});
}

if (!chrome.runtime.getBackground) {
	// Respond to pings
	chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
		if (request === chrome.runtime.id) {
			sendResponse(chrome.runtime.id);
		}
	});
}

if (typeof exports === 'object') {
	exports.pingContentScript = pingContentScript;
}
});

var pingContentScript = webextContentScriptPing.pingContentScript;

function logRuntimeErrors() {
	if (chrome.runtime.lastError) {
		console.error(chrome.runtime.lastError);
	}
}

async function injectContentScript(script, tabId) {
	const allFrames = script.all_frames;
	const runAt = script.run_at;

	// Flatten file list
	const list = [
		...script.css.map(file => ({file, fn: 'insertCSS'})),
		...script.js.map(file => ({file, fn: 'executeScript'}))
	];

	// Guarantee execution order
	for (const {file, fn} of list) {
		/* eslint no-await-in-loop: 0 */ // We actually need the loop to wait
		await new Promise(resolve => chrome.tabs[fn](tabId, {file, allFrames, runAt}, resolve));
		logRuntimeErrors(); // TODO: should errors stop the execution instead?
	}
}

async function injectContentScripts(tab) {
	// Get the tab object if we don't have it already
	if (!tab.id) {
		tab = await new Promise(resolve => chrome.tabs.get(tab, resolve));
		logRuntimeErrors();
	}

	// If we don't have the URL, we definitely can't access it.
	if (!tab.url) {
		return;
	}

	// We might just get the url because of the `tabs` permission,
	// not necessarily because we have access to the origin.
	// This will explicitly verify this permission.
	const isPermitted = await new Promise(resolve => chrome.permissions.contains({
		origins: [new URL(tab.url).origin + '/']
	}, resolve));
	logRuntimeErrors();

	if (!isPermitted) {
		return;
	}

	// Exit if already injected
	try {
		return await pingContentScript(tab.id || tab);
	} catch (err) {}

	chrome.runtime.getManifest().content_scripts.forEach(s => injectContentScript(s, tab.id));
}

var index = function (tab = false) {
	if (tab === false) {
		chrome.tabs.onUpdated.addListener((tabId, {status}) => {
			if (status === 'loading') {
				injectContentScripts(tabId);
			}
		});
	} else {
		injectContentScripts(tab);
	}
};

return index;

}());
