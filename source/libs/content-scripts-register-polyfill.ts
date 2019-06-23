function urlGlobToRegex(matchPattern: string): string {
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

	// This follows `@types/chrome`'s style"
	// eslint-disable-next-line @typescript-eslint/no-extraneous-class
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

if (!chrome.contentScripts && chrome.declarativeContent.onPageChanged) {
	chrome.contentScripts = {
		register(
			contentScriptOptions: browser.contentScripts.RegisteredContentScriptOptions,
			callback?: (registeredContentScript: browser.contentScripts.RegisteredContentScript) => void
		) {
			const {
				js = [],
				css = [],
				allFrames,
				matchAboutBlank,
				matches
			} = contentScriptOptions;

			const id = moduleId + String(Date.now());

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

	chrome.declarativeContent.onPageChanged.getRules(globalRules => {
		const moduleIds = globalRules.map(rule => rule.id!).filter(id => id && id.startsWith(moduleId));
		if (moduleIds.length > 0) {
			chrome.declarativeContent.onPageChanged.removeRules(moduleIds);
		}
	});
}
