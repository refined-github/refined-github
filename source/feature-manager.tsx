import React from 'dom-chef';
import {elementExists} from 'select-dom';
import domLoaded from 'dom-loaded';
import stripIndent from 'strip-indent';
import type {Promisable} from 'type-fest';
import * as pageDetect from 'github-url-detection';
import {isWebPage} from 'webext-detect';
import {messageRuntime} from 'webext-msg';
import oneEvent from 'one-event';

import waitFor from './helpers/wait-for.js';
import ArrayMap from './helpers/map-of-arrays.js';
import bisectFeatures from './helpers/bisect.js';
import {
	shouldFeatureRun,
	isFeaturePrivate,
	type RunConditions,
} from './helpers/feature-utils.js';
import optionsStorage, {isFeatureDisabled, type RGHOptions} from './options-storage.js';
import {
	applyStyleHotfixes,
	getLocalHotfixesAsOptions,
	preloadSyncLocalStrings,
	brokenFeatures,
} from './helpers/hotfix.js';
import asyncForEach from './helpers/async-for-each.js';
import {catchErrors, disableErrorLogging} from './helpers/errors.js';
import {getFeatureID, listenToAjaxedLoad, log, shortcutMap} from './helpers/feature-helpers.js';
import {contentScriptToggle} from './options/reload-without.js';

type FeatureInitResult = void | false;
type FeatureInit = (signal: AbortSignal) => Promisable<FeatureInitResult>;

type FeatureLoader = RunConditions & {
	/** This only adds the shortcut to the help screen, it doesn't enable it. @default {} */
	shortcuts?: Record<string, string>;

	/** Whether to wait for DOM ready before running `init`. By default, it runs `init` as soon as `body` is found. @default false */
	awaitDomReady?: true;

	/**
	When pressing the back button, DOM changes and listeners are still there. Using a selector here would use the integrated deduplication logic, but it cannot be used with `delegate` and it shouldn't use `has-rgh` and `has-rgh-inner` anymore. #5871
	@deprecated
	@default false
	*/
	deduplicate?: string;

	init: Arrayable<FeatureInit>;
};

const currentFeatureControllers = new ArrayMap<FeatureID, AbortController>();

// eslint-disable-next-line no-async-promise-executor -- Rule assumes we don't want to leave it pending
const globalReady = new Promise<RGHOptions>(async resolve => {
	if (!isWebPage()) {
		throw new Error('This script should only be run on web pages');
	}

	listenToAjaxedLoad();

	const [options, contentScripts, localHotfixes, bisectedFeatures] = await Promise.all([
		optionsStorage.getAll(),
		contentScriptToggle.get(),
		getLocalHotfixesAsOptions(),
		bisectFeatures(),
		preloadSyncLocalStrings(),
	]);

	if (!contentScripts) {
		await contentScriptToggle.remove();
		const message = 'Refined GitHub: scripts were disabled for this load, but CSS can’t be disabled this way.';
		console.warn(message);
		alert(message);
		return;
	}

	log.setup(options);

	await waitFor(() => document.body);

	if (pageDetect.is500() || pageDetect.isPasswordConfirmation()) {
		return;
	}

	if (elementExists('[refined-github]')) {
		console.warn(stripIndent(`
			Refined GitHub has been loaded twice. This may be because:

			• You loaded the developer version, or
			• The extension just updated

			If you see this at every load, please open an issue mentioning the browser you're using and the URL where this appears.
		`));
		return;
	}

	document.documentElement.setAttribute('refined-github', '');

	// Request in the background page to avoid showing a 404 request in the console
	// https://github.com/refined-github/refined-github/issues/6433
	void messageRuntime<string>({getStyleHotfixes: true}).then(applyStyleHotfixes);

	if (options.customCSS.trim().length > 0) {
		// Review #5857 and #5493 before making changes
		document.head.append(<style>{options.customCSS}</style>);
	}

	if (bisectedFeatures) {
		Object.assign(options, bisectedFeatures);
	} else {
		// If features are remotely marked as "seriously breaking" by the maintainers, disable them without having to wait for proper updates to propagate #3529
		void brokenFeatures.get();
		Object.assign(options, localHotfixes);
	}

	if (elementExists('body.logged-out')) {
		console.warn('Refined GitHub is only expected to work when you’re logged in to GitHub. Errors will not be shown.');
		disableErrorLogging();
	} else {
		catchErrors();
	}

	// Detect unload via two events to catch both clicks and history navigation
	// https://github.com/refined-github/refined-github/issues/6437#issuecomment-1489921988
	document.addEventListener('turbo:before-fetch-request', unloadAll); // Clicks
	document.addEventListener('turbo:visit', unloadAll); // Back/forward button

	resolve(options);
});

function castArray<Item>(value: Arrayable<Item>): Item[] {
	return Array.isArray(value) ? value : [value];
}

async function add(url: string, ...loaders: FeatureLoader[]): Promise<void> {
	const id = getFeatureID(url);

	/* Feature filtering and running */
	const options = await globalReady;

	// Skip disabled features, unless the feature is private
	if (isFeatureDisabled(options, id) && !isFeaturePrivate(id)) {
		if (loaders.length === 0) {
			// CSS-only https://github.com/refined-github/refined-github/issues/7944
			// GitHub cleans up the CSS disabling attributes after navigation.
			// https://github.com/refined-github/refined-github/issues/8172
			/* eslint-disable no-await-in-loop -- It's a, ahem, *event loop* */
			do {
				document.documentElement.setAttribute('rgh-OFF-' + id, '');
				log.info('↩️', 'Skipping', id);
			} while (await oneEvent(document, 'turbo:render'));
		} else {
			log.info('↩️', 'Skipping', id);
		}
		return;
	}

	if (loaders.length === 0) {
		// CSS-only
		return;
	}

	void asyncForEach(loaders, async loader => {
		// Input defaults and validation
		const {
			shortcuts = {},
			asLongAs,
			include,
			exclude,
			init,
			awaitDomReady = false,
			deduplicate = false,
		} = loader;

		if (include?.length === 0) {
			throw new Error(`${id}: \`include\` cannot be an empty array, it means "run nowhere"`);
		}

		// 404 pages should only run 404-only features
		if (pageDetect.is404() && !include?.includes(pageDetect.is404) && !asLongAs?.includes(pageDetect.is404)) {
			return;
		}

		let firstLoop = true;
		do {
			if (awaitDomReady) {
				await domLoaded;
			}
			if (firstLoop) {
				firstLoop = false;
			} else if (deduplicate && elementExists(deduplicate)) {
				continue;
			}

			if (!await shouldFeatureRun({asLongAs, include, exclude})) {
				continue;
			}

			const featureController = new AbortController();
			currentFeatureControllers.append(id, featureController);

			// Do not await, or else an error on a page will break the feature completely until a reload
			void asyncForEach(castArray(init), async init => {
				const result = await init(featureController.signal);
				// Features can return `false` when they decide not to run on the current page
				if (result !== false && !isFeaturePrivate(id)) {
					log.info('✅', id);
					// Register feature shortcuts
					for (const [hotkey, description] of Object.entries(shortcuts)) {
						shortcutMap.set(hotkey, description);
					}
				}
			});
		} while (await oneEvent(document, 'turbo:render'));
	});
}

async function addCssFeature(url: string): Promise<void> {
	void add(url);
}

function unload(featureUrl: string): void {
	const id = getFeatureID(featureUrl);
	for (const controller of currentFeatureControllers.get(id) ?? []) {
		controller.abort();
	}
}

function unloadAll(): void {
	for (const feature of currentFeatureControllers.values()) {
		for (const controller of feature) {
			controller.abort();
		}
	}

	currentFeatureControllers.clear();
}

const features = {
	add,
	unload,
	addCssFeature,
};

export default features;
