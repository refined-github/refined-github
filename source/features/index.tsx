import React from 'dom-chef';
import select from 'select-dom';
import domLoaded from 'dom-loaded';
import stripIndent from 'strip-indent';
import {Promisable} from 'type-fest';
import * as pageDetect from 'github-url-detection';

import waitFor from '../helpers/wait-for';
import onNewComments from '../github-events/on-new-comments';
import bisectFeatures from '../helpers/bisect';
import {shouldFeatureRun} from '../github-helpers';
import optionsStorage, {RGHOptions} from '../options-storage';
import {getLocalHotfixesAsOptions, getStyleHotfixes, updateHotfixes, updateStyleHotfixes} from '../helpers/hotfix';

type BooleanFunction = () => boolean;
type CallerFunction = (callback: VoidFunction) => void;
type FeatureInit = () => Promisable<false | void>;

interface FeatureLoader extends Partial<InternalRunConfig> {
	/** This only adds the shortcut to the help screen, it doesn't enable it. @default {} */
	shortcuts?: Record<string, string>;

	/** Whether to wait for DOM ready before running `init`. `false` makes `init` run right as soon as `body` is found. @default true */
	awaitDomReady?: false;

	/** When pressing the back button, DOM changes and listeners are still there, so normally `init` isn’t called again thanks to an automatic duplicate detection.
	This detection however might cause problems or not work correctly in some cases #3945, so it can be disabled with `false` or by passing a custom selector to use as duplication check
	@default true */
	deduplicate?: false | string;

	/** When true, don’t run the `init` on page load but only add the `additionalListeners`. @default false */
	onlyAdditionalListeners?: true;

	init: FeatureInit; // Repeated here because this interface is Partial<>
}

interface InternalRunConfig {
	asLongAs: BooleanFunction[] | undefined;
	include: BooleanFunction[] | undefined;
	exclude: BooleanFunction[] | undefined;
	init: FeatureInit;
	deinit?: VoidFunction | VoidFunction[];
	additionalListeners: CallerFunction[];

	onlyAdditionalListeners: boolean;
}

const {version} = browser.runtime.getManifest();

const logError = (url: string, error: unknown): void => {
	const id = getFeatureID(url);
	const message = error instanceof Error ? error.message : String(error);

	if (message.includes('token')) {
		console.log(`ℹ️ ${id} →`, message);
		return;
	}

	// Don't change this to `throw Error` because Firefox doesn't show extensions' errors in the console
	console.group('❌', id, version, pageDetect.isEnterprise() ? 'GHE →' : '→', error);

	const searchIssueUrl = new URL('https://github.com/refined-github/refined-github/issues');
	searchIssueUrl.searchParams.set('q', `is:issue is:open sort:updated-desc "${message}"`);
	console.group('Search issue');
	console.log(searchIssueUrl.href);
	console.groupEnd();

	const newIssueUrl = new URL('https://github.com/refined-github/refined-github/issues/new');
	newIssueUrl.searchParams.set('labels', 'bug');
	newIssueUrl.searchParams.set('template', '1_bug_report.yml');
	newIssueUrl.searchParams.set('title', `\`${id}\`: ${message}`);
	newIssueUrl.searchParams.set('description', stripIndent(`
		<!-- Please also include a screenshot if the issue is visible -->

		\`\`\`
		${error instanceof Error ? error.stack! : error as string}
		\`\`\`
	`));
	newIssueUrl.searchParams.set('example_url', location.href);

	const browser = /(Chrome|Firefox|Safari)\/\d+/.exec(navigator.userAgent);
	// Unknown browsers will need to be specified manually
	if (browser) {
		// @ts-expect-error navigator.userAgentData is not typed
		const {platform} = navigator.userAgentData || navigator;
		newIssueUrl.searchParams.set('browser_s_used', `${platform as string} ${browser[0]}`);
	}

	console.group('Open an issue');
	console.log(newIssueUrl.href);
	console.groupEnd();

	console.groupEnd();
};

const log = {
	info: console.log,
	http: console.log,
	error: logError,
};

// eslint-disable-next-line no-async-promise-executor -- Rule assumes we don't want to leave it pending
const globalReady: Promise<RGHOptions> = new Promise(async resolve => {
	const [options, localHotfixes, hotfixCSS, bisectedFeatures] = await Promise.all([
		optionsStorage.getAll(),
		getLocalHotfixesAsOptions(version),
		getStyleHotfixes(version),
		bisectFeatures(),
	]);

	if (hotfixCSS.length > 0 || options.customCSS.trim().length > 0) {
		await waitFor(() => document.head);
		document.head.append(
			<style>{hotfixCSS}</style>,
			<style>{options.customCSS}</style>,
		);
	}

	void updateStyleHotfixes(version);

	if (bisectedFeatures) {
		Object.assign(options, bisectedFeatures);
	} else {
		// If features are remotely marked as "seriously breaking" by the maintainers, disable them without having to wait for proper updates to propagate #3529
		void updateHotfixes(version);
		Object.assign(options, localHotfixes);
	}

	// Create logging function
	log.info = options.logging ? console.log : () => {/* No logging */};
	log.http = options.logHTTP ? console.log : () => {/* No logging */};

	await waitFor(() => document.body);

	if (pageDetect.is500() || pageDetect.isPasswordConfirmation()) {
		return;
	}

	if (select.exists('html.refined-github')) {
		console.warn(stripIndent(`
			Refined GitHub has been loaded twice. This may be because:

			• You loaded the developer version, or
			• The extension just updated

			If you see this at every load, please open an issue mentioning the browser you're using and the URL where this appears.
		`));
		return;
	}

	if (select.exists('body.logged-out')) {
		console.warn('Refined GitHub is only expected to work when you’re logged in to GitHub. Errors will not be shown.');
		features.log.error = () => {/* No logging */};
	}

	document.documentElement.classList.add('refined-github');

	resolve(options);
});

const setupPageLoad = async (id: FeatureID, config: InternalRunConfig): Promise<void> => {
	const {asLongAs, include, exclude, init, deinit, additionalListeners, onlyAdditionalListeners} = config;

	if (!shouldFeatureRun({asLongAs, include, exclude})) {
		return;
	}

	const runFeature = async (): Promise<void> => {
		try {
			// Features can return `false` when they decide not to run on the current page
			// Also the condition avoids logging the fake feature added for `has-rgh`
			if (await init() !== false && !id?.startsWith('rgh')) {
				log.info('✅', id);
			}
		} catch (error: unknown) {
			logError(id, error);
		}

		if (Array.isArray(deinit)) {
			// The `deinit` array can change until `pjax:start`. Do not loop it outside the listener.
			document.addEventListener('pjax:start', () => {
				for (const callback of deinit) {
					callback();
				}

				deinit.length = 0;
			}, {once: true});
		} else if (typeof deinit === 'function') {
			document.addEventListener('pjax:start', deinit, {once: true});
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

const shortcutMap = new Map<string, string>();

const defaultPairs = new Map([
	[pageDetect.hasComments, onNewComments],
]);

function enforceDefaults(
	id: FeatureID,
	include: InternalRunConfig['include'],
	additionalListeners: InternalRunConfig['additionalListeners'],
): void {
	for (const [detection, listener] of defaultPairs) {
		if (!include?.includes(detection)) {
			continue;
		}

		if (additionalListeners.includes(listener)) {
			console.error(`❌ ${id} → If you use \`${detection.name}\` you don’t need to specify \`${listener.name}\``);
		} else {
			additionalListeners.push(listener);
		}
	}
}

const getFeatureID = (url: string): FeatureID => url.split('/').pop()!.split('.')[0] as FeatureID;

/** Register a new feature */
const add = async (url: string, ...loaders: FeatureLoader[]): Promise<void> => {
	const id = getFeatureID(url);
	/* Feature filtering and running */
	const options = await globalReady;
	// Skip disabled features, unless the "feature" is the fake feature in this file
	if (!options[`feature:${id}`] && !id.startsWith('rgh')) {
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
			deinit,
			awaitDomReady = true,
			deduplicate = 'has-rgh',
			onlyAdditionalListeners = false,
			additionalListeners = [],
		} = loader;

		// Register feature shortcuts
		for (const [hotkey, description] of Object.entries(shortcuts)) {
			shortcutMap.set(hotkey, description);
		}

		// 404 pages should only run 404-only features
		if (pageDetect.is404() && !include?.includes(pageDetect.is404) && !asLongAs?.includes(pageDetect.is404)) {
			continue;
		}

		enforceDefaults(id, include, additionalListeners);

		const details = {asLongAs, include, exclude, init, deinit, additionalListeners, onlyAdditionalListeners};
		if (awaitDomReady) {
			(async () => {
				await domLoaded;
				await setupPageLoad(id, details);
			})();
		} else {
			void setupPageLoad(id, details);
		}

		document.addEventListener('pjax:end', () => {
			if (!deduplicate || !select.exists(deduplicate)) {
				void setupPageLoad(id, details);
			}
		});
	}
};

const addCssFeature = async (url: string, include: BooleanFunction[] | undefined, deduplicate?: false | string): Promise<void> => {
	const id = getFeatureID(url);
	void add(id, {
		include,
		deduplicate,
		awaitDomReady: false,
		init: () => {
			document.body.classList.add('rgh-' + id);
		},
	});
};

/*
When navigating back and forth in history, GitHub will preserve the DOM changes;
This means that the old features will still be on the page and don't need to re-run.

This marks each as "processed"
*/
void add('rgh-deduplicator' as FeatureID, {
	deduplicate: false,
	init: async () => {
		// `await` kicks it to the next tick, after the other features have checked for 'has-rgh', so they can run once.
		await Promise.resolve();
		select('#js-repo-pjax-container, #js-pjax-container')?.append(<has-rgh/>);
		select('#repo-content-pjax-container')?.append(<has-rgh-inner/>); // #4567
	},
});

const features = {
	add,
	addCssFeature,
	log,
	shortcutMap,
	getFeatureID,
};

export default features;
