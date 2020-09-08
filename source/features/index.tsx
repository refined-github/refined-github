import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import domLoaded from 'dom-loaded';
import stripIndent from 'strip-indent';
import {Promisable} from 'type-fest';
import elementReady from 'element-ready';
import looseVersionCompare from 'tiny-version-compare';
import * as pageDetect from 'github-url-detection';

import onNewComments from '../github-events/on-new-comments';
import onNewsfeedLoad from '../github-events/on-newsfeed-load';
import optionsStorage, {RGHOptions} from '../options-storage';

type BooleanFunction = () => boolean;
type CallerFunction = (callback: VoidFunction) => void;
type FeatureInit = () => Promisable<false | void>;

interface FeatureMeta {
	/**
	If it's disabled, this should be the issue that explains why, as a reference
	@example '#123'
	*/
	disabled?: string;
	id: FeatureID;
	description: string;
	screenshot: string | false;
	shortcuts?: FeatureShortcuts;
}

interface FeatureLoader extends Partial<InternalRunConfig> {
	/** Whether to wait for DOM ready before runnin `init`. `false` makes `init` run right as soon as `body` is found. @default true */
	waitForDomReady?: false;

	/** When pressing the back button, the DOM and listeners are still there, so normally `init` isn’t called again. If this is true, it’s called anyway.  @default false */
	repeatOnBackButton?: true;

	/** When true, don’t run the `init` on page load but only add the `additionalListeners`. @default false */
	onlyAdditionalListeners?: true;

	init: FeatureInit; // Repeated here because this interface is Partial<>
}

interface InternalRunConfig {
	include: BooleanFunction[];
	exclude: BooleanFunction[];
	init: FeatureInit;
	deinit?: () => void;
	additionalListeners: CallerFunction[];

	onlyAdditionalListeners: boolean;
}

let log: typeof console.log;

function logError(id: FeatureID, error: Error | string, ...extras: unknown[]): void {
	if (error instanceof TypeError && error.message === 'Object(...)(...) is null') {
		error.message = 'The element wasn’t found, the selector needs to be updated.';
	}

	const message = typeof error === 'string' ? error : error.message;

	if (message.includes('token')) {
		console.log(`ℹ️ Refined GitHub → ${id} →`, message);
		return;
	}

	// Don't change this to `throw Error` because Firefox doesn't show extensions' errors in the console.
	// Use `return` after calling this function.
	console.error(
		`❌ Refined GitHub → ${id} →`,
		error,
		...extras,
		stripIndent(`
			Search issue: https://github.com/sindresorhus/refined-github/issues?q=is%3Aissue+${encodeURIComponent(message)}

			Open an issue: https://github.com/sindresorhus/refined-github/issues/new?labels=bug&template=bug_report.md&title=${encodeURIComponent(`\`${id}\`: ${message}`)}
		`)
	);
}

// Rule assumes we don't want to leave it pending:
// eslint-disable-next-line no-async-promise-executor
const globalReady: Promise<RGHOptions> = new Promise(async resolve => {
	await elementReady('body');

	if (pageDetect.is500()) {
		return;
	}

	if (document.title === 'Confirm password') {
		return;
	}

	if (document.body.classList.contains('logged-out')) {
		console.warn('%cRefined GitHub%c is only expected to work when you’re logged in to GitHub.', 'font-weight: bold', '');
	}

	if (select.exists('html.refined-github')) {
		console.warn('Refined GitHub has been loaded twice. If you didn’t install the developer version, this may be a bug. Please report it to: https://github.com/sindresorhus/refined-github/issues/565');
		return;
	}

	document.documentElement.classList.add('refined-github');

	// Options defaults
	const options = await optionsStorage.getAll();

	// Fetch hotfixes asynchronously
	const hotfix = await cache.get('hotfix');
	checkForHotfixes();
	Object.assign(options, hotfix);

	if (options.customCSS.trim().length > 0) {
		document.head.append(<style>{options.customCSS}</style>);
	}

	// Create logging function
	log = options.logging ? console.log : () => {/* No logging */};

	resolve(options);
});

const setupPageLoad = async (id: FeatureID, config: InternalRunConfig): Promise<void> => {
	const {include, exclude, init, deinit, additionalListeners, onlyAdditionalListeners} = config;

	// If every `include` is false and no `exclude` is true, don’t run the feature
	if (include.every(c => !c()) || exclude.some(c => c())) {
		return;
	}

	const runFeature = async (): Promise<void> => {
		try {
			// Features can return `false` when they decide not to run on the current page
			// Also the condition avoids logging the fake feature added for `has-rgh`
			if (await init() !== false && id !== __filebasename) {
				log('✅', id);
			}
		} catch (error) {
			logError(id, error);
		}

		if (deinit) {
			document.addEventListener('pjax:start', deinit, {
				once: true
			});
		}
	};

	if (!onlyAdditionalListeners) {
		await runFeature();
	}

	await domLoaded; // Listeners likely need to work on the whole page
	for (const listener of additionalListeners) {
		listener(runFeature);
	}
};

// Fetch hotfix releases asynchronously
// every 6 hours ( 4 times a day )
// this is achieved by GETting a JSON file
// from the hotfix branch and comparing
// with the current version of extension
const checkForHotfixes = cache.function(async () => {
	const response = await fetch('https://raw.githubusercontent.com/sindresorhus/refined-github/hotfix/hotfix.json');
	const hotfixes: AnyObject | false = await response.json();

	if (hotfixes && hotfixes.unaffected) {
		const currentVersion = browser.runtime.getManifest().version;
		if (looseVersionCompare(hotfixes.unaffected, currentVersion) >= 0) {
			return {};
		}
	}

	return hotfixes;
}, {
	maxAge: {hours: 6},
	cacheKey: 'hotfix'
});

const shortcutMap = new Map<string, string>();

const defaultPairs = new Map([
	[pageDetect.hasComments, onNewComments],
	[pageDetect.isDashboard, onNewsfeedLoad]
]);

function enforceDefaults(
	id: FeatureID,
	include: InternalRunConfig['include'],
	additionalListeners: InternalRunConfig['additionalListeners']
): void {
	for (const [detection, listener] of defaultPairs) {
		if (!include.includes(detection)) {
			continue;
		}

		if (additionalListeners.includes(listener)) {
			console.error(`❌ ${id} → If you use \`${detection.name}\` you don’t need to specify \`${listener.name}\``);
		} else {
			additionalListeners.push(listener);
		}
	}
}

/** Register a new feature */
const add = async (meta?: FeatureMeta, ...loaders: FeatureLoader[]): Promise<void> => {
	/* Input defaults and validation */
	const {
		id = __filebasename,
		disabled = false,
		shortcuts = {}
	} = meta ?? {};

	/* Feature filtering and running */
	const options = await globalReady;
	if (disabled || options[`feature:${id}`] === false) {
		log('↩️', 'Skipping', id, disabled ? `because of ${disabled}` : '');
		return;
	}

	// Register feature shortcuts
	for (const [hotkey, description] of Object.entries(shortcuts)) {
		shortcutMap.set(hotkey, description);
	}

	for (const loader of loaders) {
		// Input defaults and validation
		const {
			include = [() => true], // Default: every page
			exclude = [], // Default: nothing
			init,
			deinit,
			waitForDomReady = true,
			repeatOnBackButton = false,
			onlyAdditionalListeners = false,
			additionalListeners = []
		} = loader;

		// 404 pages should only run 404-only features
		if (pageDetect.is404() && !include.includes(pageDetect.is404)) {
			continue;
		}

		enforceDefaults(id, include, additionalListeners);

		const details = {include, exclude, init, deinit, additionalListeners, onlyAdditionalListeners};
		if (waitForDomReady) {
			(async () => {
				await domLoaded;
				await setupPageLoad(id, details);
			})();
		} else {
			void setupPageLoad(id, details);
		}

		document.addEventListener('pjax:end', () => {
			if (repeatOnBackButton || !select.exists('has-rgh')) {
				void setupPageLoad(id, details);
			}
		});
	}
};

/*
When navigating back and forth in history, GitHub will preserve the DOM changes;
This means that the old features will still be on the page and don't need to re-run.

This marks each as "processed"
*/
void add(undefined, {
	init: async () => {
		// `await` kicks it to the next tick, after the other features have checked for 'has-rgh', so they can run once.
		await Promise.resolve();
		select('#js-repo-pjax-container, #js-pjax-container')?.append(<has-rgh/>);
	}
});

const features = {
	add,
	error: logError,
	shortcutMap
};

export default features;
