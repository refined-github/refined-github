import React from 'dom-chef';
import select from 'select-dom';
import onDomReady from 'dom-loaded';
import elementReady from 'element-ready';
import optionsStorage, {RGHOptions} from '../options-storage';
import * as pageDetect from './page-detect';
import {logError} from './utils';

type BooleanFunction = () => boolean;
type VoidFunction = () => void;
type callerFunction = (callback: VoidFunction) => void;

type FeatureShortcuts = Record<string, string>;

interface Shortcut {
	hotkey: string;
	description: string;
}

interface FeatureMeta {
	/**
	If it's disabled, this should be the issue that explains why, as a reference
	@example '#123'
	*/
	disabled?: string;
	id: typeof __featureName__;
	description: string | false;
	screenshot: string | false;
	shortcuts?: FeatureShortcuts;
}
interface FeatureLoader {
	include?: BooleanFunction[];
	exclude?: BooleanFunction[];
	init: () => false | void | Promise<false | void>;
	deinit?: () => void;
	load?: callerFunction | Promise<void>;
}

/*
 * When navigating back and forth in history, GitHub will preserve the DOM changes;
 * This means that the old features will still be on the page and don't need to re-run.
 * For this reason `onAjaxedPages` will only call its callback when a *new* page is loaded.
 *
 * Alternatively, use `onAjaxedPagesRaw` if your callback needs to be called at every page
 * change (e.g. to "unmount" a feature / listener) regardless of *newness* of the page.
 */
function onAjaxedPagesRaw(callback: () => void): void {
	document.addEventListener('pjax:end', callback);
	callback();
}

function onAjaxedPages(callback: () => void): void {
	onAjaxedPagesRaw(async () => {
		await onDomReady;
		if (!select.exists('has-rgh')) {
			callback();
		}
	});
}

// Like onAjaxedPages but doesn't wait for `dom-ready`
function nowAndOnAjaxedPages(callback: () => void): void {
	onAjaxedPagesRaw(() => {
		if (!select.exists('has-rgh')) {
			callback();
		}
	});
}

// Must be called after all the features were added to onAjaxedPages
// to mark the current load as "done", so history.back() won't reapply the same DOM changes.
// The two `await` ensure this behavior and order.
onAjaxedPages(async () => {
	await globalReady; // Match `add()`
	await Promise.resolve(); // Kicks it to the next tick, after the other features have `run()`

	select('#js-repo-pjax-container, #js-pjax-container')?.append(<has-rgh/>);
});

let log: typeof console.log;

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

	if (options.customCSS.trim().length > 0) {
		document.head.append(<style>{options.customCSS}</style>);
	}

	// Create logging function
	log = options.logging ? console.log : () => { };

	resolve(options);
});

const run = async (id: typeof __featureName__, {include, exclude, init, deinit}: FeatureLoader): Promise<void> => {
	// If every `include` is false and no `exclude` is true, don’t run the feature
	if (include!.every(c => !c()) || exclude!.some(c => c())) {
		return deinit!();
	}

	try {
		// Features can return `false` when they decide not to run on the current page
		if (await init() !== false) {
			log('✅', id);
		}
	} catch (error) {
		if (error.message.includes('token')) {
			console.log(`ℹ️ Refined GitHub: \`${id}\`:`, error.message);
		} else {
			logError(id, error);
		}
	}
};

const shortcutMap = new Map<string, Shortcut>();
const getShortcuts = (): Shortcut[] => [...shortcutMap.values()];
const noop = () => {};

/*
 * Register a new feature
 */
const add = async (meta: FeatureMeta, ...loaders: FeatureLoader[]): Promise<void> => {
	/* Input defaults and validation */
	const {
		id,
		disabled = false,
		shortcuts = {}
	} = meta;

	/* Feature filtering and running */
	const options = await globalReady;
	if (disabled || options[`feature:${id}`] === false) {
		log('↩️', 'Skipping', id, disabled ? `because of ${disabled}` : '');
		return;
	}

	// Register feature shortcuts
	for (const hotkey of Object.keys(shortcuts)) {
		const description = shortcuts[hotkey];
		shortcutMap.set(hotkey, {hotkey, description});
	}

	for (const loader of loaders) {
		// Input defaults and validation
		const filledLoader: Required<FeatureLoader> = {
				include: [() => true], // Default: every page
			exclude: [], // Default: nothing
			load: (fn: VoidFunction) => fn(), // Run it right away
			deinit: noop,
			...loader
		}

		// 404 pages should only run 404-only features
		if (pageDetect.is404() && !filledLoader.include.includes(pageDetect.is404)) {
			continue;
		}

		const loads = Array.isArray(filledLoader.load) ? filledLoader.load : [filledLoader.load];
		for (const load of loads) {
			// Initialize the feature using the specified loading mechanism
			if (load instanceof Promise) {
				await load;
				run(id, filledLoader);
			} else {
				load(() => run(id, filledLoader));
			}
		}
	}
};

export default {
	// Module methods
	add,
	getShortcuts,

	// Loading mechanisms
	onDomReady,
	onAjaxedPages,
	nowAndOnAjaxedPages,
	onAjaxedPagesRaw,

	// Loading filters
	...pageDetect
};
