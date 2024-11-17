import React from 'dom-chef';
import {$optional} from 'select-dom/strict.js';
import {elementExists} from 'select-dom';
import domLoaded from 'dom-loaded';
import stripIndent from 'strip-indent';
import type {Promisable} from 'type-fest';
import * as pageDetect from 'github-url-detection';
import {isWebPage} from 'webext-detect';
import {messageRuntime} from 'webext-msg';

import waitFor from './helpers/wait-for.js';
import ArrayMap from './helpers/map-of-arrays.js';
import bisectFeatures from './helpers/bisect.js';
import {
	type BooleanFunction,
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
	_,
} from './helpers/hotfix.js';
import asyncForEach from './helpers/async-for-each.js';
import {catchErrors, disableErrorLogging} from './helpers/errors.js';

type FeatureInitResult = void | false;
type FeatureInit = (signal: AbortSignal) => Promisable<FeatureInitResult>;

type FeatureLoader = {
	/** This only adds the shortcut to the help screen, it doesn't enable it. @default {} */
	shortcuts?: Record<string, string>;

	/** Whether to wait for DOM ready before running `init`. By default, it runs `init` as soon as `body` is found. @default false */
	awaitDomReady?: true;

	/**
	When pressing the back button, DOM changes and listeners are still there. Using a selector here would use the integrated deduplication logic, but it cannot be used with `delegate` and it shouldn't use `has-rgh` and `has-rgh-inner` anymore. #5871 #
	@deprecated
	@default false
	*/
	deduplicate?: string;

	/** Whether to only init once, and not on future AJAX loads (the signal will never abort) */
	once?: false;

	init: Arrayable<FeatureInit>; // Repeated here because this interface is Partial<>
} & Partial<InternalRunConfig>;

type InternalRunConfig = RunConditions & {
	init: Arrayable<FeatureInit>;
	shortcuts: Record<string, string>;
};

const shortcutMap = new Map<string, string>();
const getFeatureID = (url: string): FeatureID => url.split('/').pop()!.split('.')[0] as FeatureID;

const currentFeatureControllers = new ArrayMap<FeatureID, AbortController>();

const log = {
	info: console.log,
	http: console.log.bind(console, '🌏'),
};

// eslint-disable-next-line no-async-promise-executor -- Rule assumes we don't want to leave it pending
const globalReady = new Promise<RGHOptions>(async resolve => {
	// This file may be imported in the options
	if (!isWebPage()) {
		return;
	}

	const [options, localHotfixes, bisectedFeatures] = await Promise.all([
		optionsStorage.getAll(),
		getLocalHotfixesAsOptions(),
		bisectFeatures(),
		preloadSyncLocalStrings(),
	]);

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

	// Create logging function
	if (!options.logging) {
		log.info = () => {/* No logging */};
	}

	if (!options.logHTTP) {
		log.http = () => {/* No logging */};
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

const persistentSignal = new AbortController().signal;

async function maybeRun(id: FeatureID, {asLongAs, include, exclude, init, shortcuts}: InternalRunConfig): Promise<void> {
	if (!await shouldFeatureRun({asLongAs, include, exclude})) {
		return;
	}

	const featureController = new AbortController();
	currentFeatureControllers.append(id, featureController);

	await asyncForEach(castArray(init), async init => {
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
}

type FeatureHelper = {
	/** If `import.meta.url` is passed as URL, this will be the feature ID */
	id: string;

	/** A class name that can be added as attribute */
	class: string;

	/** A class selector that can be used with querySelector */
	selector: string;
};

function getIdentifiers(url: string): FeatureHelper {
	const id = getFeatureID(url);
	return {
		id,
		class: 'rgh-' + id,
		selector: '.rgh-' + id,
	};
}

/** Register a new feature */
async function add(url: string, ...loaders: FeatureLoader[]): Promise<void> {
	const id = getFeatureID(url);
	/* Feature filtering and running */
	const options = await globalReady;
	// Skip disabled features, unless the feature is private
	if (isFeatureDisabled(options, id) && !isFeaturePrivate(id)) {
		log.info('↩️', 'Skipping', id);
		return;
	}

	for (const loader of loaders) {
		// Input defaults and validation
		const {
			shortcuts = {},
			asLongAs,
			include,
			exclude,
			init,
			awaitDomReady = false,
			deduplicate = false,
			once = false,
		} = loader;

		if (include?.length === 0) {
			throw new Error(`${id}: \`include\` cannot be an empty array, it means "run nowhere"`);
		}

		// 404 pages should only run 404-only features
		if (pageDetect.is404() && !include?.includes(pageDetect.is404) && !asLongAs?.includes(pageDetect.is404)) {
			continue;
		}

		const onceController = new AbortController();
		const details = {
			asLongAs,
			include,
			exclude,
			init: once
				// Call `init` once and then make sure it doesn't get called again
				? castArray(init).map(init => () => {
					onceController.abort();
					return init(persistentSignal);
				})
				: init,
			shortcuts,
		};
		if (awaitDomReady) {
			(async () => {
				await domLoaded;
				await maybeRun(id, details);
			})();
		} else {
			void maybeRun(id, details);
		}

		document.addEventListener('turbo:render', () => {
			if (!deduplicate || !elementExists(deduplicate)) {
				void maybeRun(id, details);
			}
		}, {signal: onceController.signal});
	}
}

async function addCssFeature(url: string, include?: BooleanFunction[]): Promise<void> {
	const id = getFeatureID(url);
	void add(id, {
		include,
		init() {
			document.documentElement.setAttribute('rgh-' + id, '');
		},
	});
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

/*
When navigating back and forth in history, GitHub will preserve the DOM changes;
This means that the old features will still be on the page and don't need to re-run.

This marks each as "processed"
*/
void add('rgh-deduplicator' as FeatureID, {
	awaitDomReady: true,
	async init() {
		// `await` kicks it to the next tick, after the other features have checked for 'has-rgh', so they can run once.
		await Promise.resolve();
		$optional('has-rgh')?.remove(); // https://github.com/refined-github/refined-github/issues/6568
		$optional(_`#js-repo-pjax-container, #js-pjax-container`)?.append(<has-rgh />);
		$optional(_`turbo-frame`)?.append(<has-rgh-inner />); // #4567
	},
});

const features = {
	add,
	unload,
	addCssFeature,
	log,
	shortcutMap,
	getFeatureID,
	getIdentifiers,
};

export default features;
