/* global chrome */
import './content-scripts-register-polyfill';

const registeredScripts = new Map<string, browser.contentScripts.RegisteredContentScript>();
function registerOnOrigins(origins: string[]): void {
	const configs = browser.runtime.getManifest().content_scripts!;
	for (const config of configs) {
		console.log({
			js: (config.js || []).map(file => ({file})),
			css: (config.css || []).map(file => ({file})),
			allFrames: config.all_frames,
			matches: origins,
			runAt: config.run_at
		});

		// Needs to be registered one at a time to allow removing one at a time as well
		for (const origin of origins) {
			browser.contentScripts.register({
				js: (config.js || []).map(file => ({file})),
				css: (config.css || []).map(file => ({file})),
				allFrames: config.all_frames,
				matches: [origin],
				runAt: config.run_at

				/* `await` requires a separate Promise[], an additional loop, and/or complicates the loop in `chrome.permissions.onRemoved` */
				// eslint-disable-next-line promise/prefer-await-to-then
			}).then(registeredScript => registeredScripts.set(origin, registeredScript));
		}
	}
}

chrome.permissions.onAdded.addListener(async ({origins}) => {
	console.log(origins);
	if (!origins || origins.length === 0) {
		return;
	}

	registerOnOrigins(origins);
});

chrome.permissions.onRemoved.addListener(async ({origins}}) => {
	console.log(origins);
	if (!origins || origins.length === 0) {
		return;
	}

	for (const [origin, script] of registeredScripts) {
		if (origins.includes(origin)) {
			script.unregister();
		}
	}
});
