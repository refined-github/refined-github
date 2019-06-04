function urlGlobToRegex(matchPattern: string) {
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
type _contentScriptsRegister = typeof browser.contentScripts.register;
declare namespace chrome.contentScripts {
	const register: _contentScriptsRegister;
}

declare namespace chrome.declarativeContent {
	interface ContentScript {
		css?: string[];
		js?: string[];
		allFrames?: boolean;
		matchAboutBlank?: boolean;
	}

	export class RequestContentScript {
		constructor(contentScript: ContentScript);
	}
}

function fileFilter(item: browser.extensionTypes.ExtensionFileOrCode): string {
	if (typeof (item as any).file === 'string') {
		return (item as any).file;
	}

	throw new TypeError('Only files are supported by webext-content-script-register-polyfill');
}

function init() {
	chrome.contentScripts = {
		register(contentScriptOptions: browser.contentScripts.RegisteredContentScriptOptions, callback?: Function) {
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
						js: js.map(fileFilter),
						css: css.map(fileFilter),
						allFrames,
						matchAboutBlank
					})
				]
			}]);

			const registeredContentScript = {
				unregister() {
					return new Promise(resolve => {
						chrome.declarativeContent.onPageChanged.removeRules([id], resolve);
					});
				}
			};
			if (typeof callback === 'function') {
				callback(registeredContentScript);
			}

			return Promise.resolve(registeredContentScript);
		}
	};

	console.log('cleaning up')
	chrome.declarativeContent.onPageChanged.getRules(globalRules => {
		console.log(globalRules)
		const moduleRules = globalRules.filter(rule => rule.id && rule.id.startsWith(moduleId));
		console.log(moduleRules)
		if (moduleRules.length > 0) {
			chrome.declarativeContent.onPageChanged.removeRules(moduleRules.map(rule => rule.id!));
			console.log('cleaned!')
		}
	})
}

if (!chrome.contentScripts && chrome.declarativeContent.onPageChanged) {
	init();
}
