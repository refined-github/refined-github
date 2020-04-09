import React from 'dom-chef';
import select from 'select-dom';
import domLoaded from 'dom-loaded';
import elementReady from 'element-ready';
import {logError} from './utils';
import * as pageDetect from './page-detect';
import optionsStorage, {RGHOptions} from '../options-storage';

type BooleanFunction = () => boolean;
type VoidFunction = () => void;
type callerFunction = (callback: VoidFunction) => void; // TODO: rename
type FeatureShortcuts = Record<string, string>;
type FeatureInit = () => false | void | Promise<false | void>;

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
	id: FeatureName;
	description: string;
	screenshot: string | false;
	shortcuts?: FeatureShortcuts;
}

interface FeatureLoader extends Partial<InternalRunConfig> {
	waitForDomReady?: boolean;
	repeatOnAjax?: boolean;
	init: FeatureInit; // Required for end user
}

interface InternalRunConfig {
	include: BooleanFunction[];
	exclude: BooleanFunction[];
	init: FeatureInit;
	deinit?: () => void;
	listeners: callerFunction[];
}

/*
 * When navigating back and forth in history, GitHub will preserve the DOM changes;
 * This means that the old features will still be on the page and don't need to re-run.
 * For this reason `onAjaxedPages` will only call its callback when a *new* page is loaded.
 *
 * Alternatively, use `onAjaxedPagesRaw` if your callback needs to be called at every page
 * change (e.g. to "unmount" a feature / listener) regardless of *newness* of the page.
 */

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

const run = async (id: FeatureName, {include, exclude, init, deinit, listeners}: InternalRunConfig): Promise<void> => {
	// If every `include` is false and no `exclude` is true, don’t run the feature
	if (include!.every(c => !c()) || exclude!.some(c => c())) {
		// TODO: maybe move deinit() to the `ajax:start|once` listener. Review the whole mechanism
		return deinit?.();
	}

	const _run = async (): Promise<void> => {
		try {
			// Features can return `false` when they decide not to run on the current page
			if (await init() !== false) {
				log('✅', id);
			}
		} catch (error) {
			logError(id, error);
		}
	}

	await _run();
	for (const listener of listeners) {
		listener(_run);
	}
};

const shortcutMap = new Map<string, Shortcut>();
const getShortcuts = (): Shortcut[] => [...shortcutMap.values()];

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
		// TODO: use Object.entries, change format of shortcutMap
		const description = shortcuts[hotkey];
		shortcutMap.set(hotkey, {hotkey, description});
	}

	for (const loader of loaders) {
		// Input defaults and validation
		const {
			include = [() => true], // Default: every page
			exclude = [], // Default: nothing
			init,
			deinit,
			repeatOnAjax = true,
			waitForDomReady = true,
			listeners = []
		} = loader;

		// 404 pages should only run 404-only features
		if (pageDetect.is404() && !include.includes(pageDetect.is404)) {
			continue;
		}

		const details = {include, exclude, init, deinit, listeners};
		if (waitForDomReady) {
			domLoaded.then(() => run(id, details));
		} else {
			run(id, details);
		}

		if (repeatOnAjax) {
			document.addEventListener('pjax:end', () => {
				if (!select.exists('has-rgh')) {
					run(id, details);
				}
			});
		}
	}
};

export default {
	// Module methods
	add,
	getShortcuts,

	// Loading filters
	...pageDetect
};
