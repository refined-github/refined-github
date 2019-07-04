/* global chrome */
import 'content-scripts-register-polyfill';
import 'chrome-permissions-events-polyfill';

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
	const manifest = browser.runtime.getManifest();
	const configs = manifest.content_scripts!;
	const manifestOrigins = [
		...(manifest.permissions || []).filter(permission => permission.includes('://')),
		...configs.flatMap(config => config.matches)
	];

	for (const config of configs) {
		// Register one at a time to allow removing one at a time as well
		for (const origin of origins) {
			// This origin is already part of `manifest.json`
			if (manifestOrigins.includes(origin)) {
				continue;
			}

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

// Automatically register the content scripts on the new origins.
// `registerOnOrigins` already takes care of excluding origins in `manifest.json`
chrome.permissions.getAll(({origins}) => registerOnOrigins(origins!));

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
