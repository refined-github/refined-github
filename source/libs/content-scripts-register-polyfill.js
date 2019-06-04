/* global chrome */
console.log('yooooooooooo')
async function p(fn, ...args) {
	return new Promise((resolve, reject) => fn(...args, r => {
		if (chrome.runtime.lastError) {
			reject(chrome.runtime.lastError);
		} else {
			resolve(r);
		}
	}));
}

function urlGlobToRegex(matchPattern) {
	return '^' + matchPattern
		.replace(/[.]/g, '\\.') // Escape dots
		.replace(/[?]/, '.') // Single-character wildcards
		.replace(/^[*]:/, 'https?') // Protocol
		.replace(/^(https[?]?:[/][/])[*]/, '$1[^/:]+') // Subdomain wildcard
		.replace(/[/][*]/, '/?.+') // Whole path wildcards (so it can match the whole origin)
		.replace(/[*]/g, '.+') // Path wildcards
		.replace(/[/]/g, '\\/'); // Escape slashes
}

const moduleId = 'webext-content-script-register:';

let clean = false;
async function cleanup() {
	if (clean) {
		return;
	}

	console.log('cleaning up')
	const globalRules = await p(r => chrome.declarativeContent.onPageChanged.getRules(r));
	console.log(globalRules)
	const moduleRules = globalRules.filter(rule => rule.id.startsWith(moduleId));
	console.log(moduleRules)
	if (moduleRules.length > 0) {
		await p(r => chrome.declarativeContent.onPageChanged.removeRules(r), moduleRules);
	}

	console.log('cleaned')

	clean = true;
}

function init() {
	chrome.contentScripts = {
		async register(contentScriptOptions, callback) {
			await cleanup();
			const {
				js = [],
				css = [],
				allFrames,
				matchAboutBlank,
				matches
			} = contentScriptOptions;

			const id = moduleId + Date.now();
			console.log(id);
			console.log(matches);
			console.log(matches.map(urlGlobToRegex));

			chrome.declarativeContent.onPageChanged.addRules([{
				id,
				conditions: matches.map(matchPattern =>
					new chrome.declarativeContent.PageStateMatcher({
						pageUrl: {
							urlMatches: urlGlobToRegex(matchPattern)
						}
					})
				),
				actions: [
					new chrome.declarativeContent.RequestContentScript({
						js: js.map(item => item.file),
						css: css.map(item => item.file),
						allFrames,
						matchAboutBlank
					})
				]
			}]);

			if (typeof callback === 'function') {
				callback({
					unregister() {
						chrome.declarativeContent.PageStateMatcher.removeRules([id]);
					}
				});
			}
		}
	};
}

if (!chrome.contentScripts && chrome.declarativeContent.onPageChanged) {
	init();
}
