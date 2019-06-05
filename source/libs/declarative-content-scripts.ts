/* global chrome */
import './content-scripts-register-polyfill';
import './permission-events-polyfill';

const registeredScripts = new Map<string, browser.contentScripts.RegisteredContentScript>();
function registerOnOrigins(origins: string[]): void {
	console.log('getting origins')
	const configs = browser.runtime.getManifest().content_scripts!;
	console.log('orogins are shit', configs)
	// In Firefox, paths in the manifest are converted to full URLs under `moz-extension://` but browser.contentScripts expects exclusively relative paths
	const convertPath = (file: string) => {
		const url = new URL(file, location.origin);
		return {file: url.pathname}; // Firefox
	};
	for (const config of configs) {
		console.log({
			js: (config.js || []).map(convertPath),
			css: (config.css || []).map(convertPath),
			allFrames: config.all_frames,
			matches: origins,
			runAt: config.run_at
		});

		// Needs to be registered one at a time to allow removing one at a time as well
		for (const origin of origins) {
			console.log('will register', origin)
			browser.contentScripts.register({
				js: (config.js || []).map(convertPath),
				css: (config.css || []).map(convertPath),
				allFrames: config.all_frames,
				matches: [origin],
				runAt: config.run_at

				/* `await` requires a separate Promise[], an additional loop, and/or complicates the loop in `chrome.permissions.onRemoved` */
				// eslint-disable-next-line promise/prefer-await-to-then
			}).then(registeredScript => {
				console.log(registeredScript, origin);
				registeredScripts.set(origin, registeredScript);
			}, lol => {
				console.log('ERROR?!, WTF', lol)
			});
		}
	}
}
console.log('****************************')
console.log('****************************')
console.log('****************************')
console.log('****************************')
console.log('****************************')
console.log('****************************')
console.log('****************************')
console.log('****************************')
console.log('****************************')
console.log('****************************')
console.log('****************************')
console.log('****************************')
console.log('****************************')
chrome.permissions.onAdded.addListener(async ({origins}) => {
	console.log('PERMISSIONS WERE ADDED')

	console.log(origins);
	if (!origins || origins.length === 0) {
		return;
	}

	console.log('will register shit on', origins);
	registerOnOrigins(origins);
});

chrome.permissions.onRemoved.addListener(async ({origins}) => {
	console.log('PERMISSIONS WERE DROPPED')
	console.log(origins);
	console.log(registeredScripts)
	if (!origins || origins.length === 0) {
		return;
	}

	for (const [origin, script] of registeredScripts) {
		console.log(origin)
		if (origins.includes(origin)) {
			script.unregister();
		}
	}
});
