/* global chrome */
import 'content-scripts-register-polyfill';
import 'webext-permissions-events-polyfill';
import {getAdditionalPermissions} from 'webext-additional-permissions';

const registeredScripts = new Map<
string,
Promise<browser.contentScripts.RegisteredContentScript>
>();

// In Firefox, paths in the manifest are converted to full URLs under `moz-extension://` but browser.contentScripts expects exclusively relative paths
function convertPath(file: string): browser.extensionTypes.ExtensionFileOrCode {
	const url = new URL(file, location.origin);
	return {file: url.pathname};
}

// Automatically register the content scripts on the new origins
async function registerOnOrigins({origins: newOrigins}: chrome.permissions.Permissions): Promise<void> {
	const manifest = browser.runtime.getManifest().content_scripts!;

	// Register one at a time to allow removing one at a time as well
	for (const origin of newOrigins || []) {
		for (const config of manifest) {
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

(async () => {
	registerOnOrigins(await getAdditionalPermissions());
})();

chrome.permissions.onAdded.addListener(permissions => {
	if (permissions.origins && permissions.origins.length > 0) {
		registerOnOrigins(permissions);
	}
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
