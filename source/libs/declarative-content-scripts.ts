/* global chrome */
import './content-scripts-register-polyfill.ts';
import './permission-events-polyfill';

const registeredScripts = new Map<
string,
Promise<browser.contentScripts.RegisteredContentScript>
>();

// In Firefox, paths in the manifest are converted to full URLs under `moz-extension://` but browser.contentScripts expects exclusively relative paths
function convertPath(file: string): browser.extensionTypes.ExtensionFileOrCode {
	const url = new URL(file, location.origin);
	return {file: url.pathname};
}

async function registerOnOrigins(origins: string[]): Promise<void> {
	const configs = browser.runtime.getManifest().content_scripts!;

	for (const config of configs) {
		// Register one at a time to allow removing one at a time as well
		for (const origin of origins) {
			const registeredScript = browser.contentScripts.register({
				js: (config.js || []).map(convertPath),
				css: (config.css || []).map(convertPath),
				allFrames: config.all_frames,
				matches: [origin],
				runAt: config.run_at
			});
			registeredScripts.set(origin, registeredScript);
		}
	}
}

chrome.permissions.onAdded.addListener(({origins}) => {
	if (!origins || origins.length === 0) {
		return;
	}

	registerOnOrigins(origins);
});

chrome.permissions.onRemoved.addListener(async ({origins}) => {
	if (!origins || origins.length === 0) {
		return;
	}

	for (const [origin, script] of registeredScripts) {
		if (origins.includes(origin)) {
			// eslint-disable-next-line no-await-in-loop
			(await script).unregister();
		}
	}
});
