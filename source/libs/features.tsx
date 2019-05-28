import React from 'dom-chef';
import select from 'select-dom';
import onDomReady from 'dom-loaded';
import elementReady from 'element-ready';
import optionsStorage, {Options} from '../options-storage';
import onNewComments from './on-new-comments';
import onFileListUpdate from './on-file-list-update';
import * as pageDetect from './page-detect';

type BooleanFunction = () => boolean;
type VoidFunction = () => void;
type callerFunction = (callback: VoidFunction) => void;

type FeatureShortcuts = Record<string, string>;

interface Shortcut {
	hotkey: string;
	description: string;
}

export interface FeatureDetails {
	disabled?: string; // If it's disabled, this should be the URL to the issue that explains why
	id: string;
	description: string;
	screenshot?: string;
	include?: BooleanFunction[];
	exclude?: BooleanFunction[];
	init: () => false | void | Promise<false | void>;
	deinit?: () => void;
	load?: callerFunction | Promise<void>;
	shortcuts?: FeatureShortcuts;
}

/*
 * When navigating back and forth in history, GitHub will preserve the DOM changes;
 * This means that the old features will still be on the page and don't need to re-run.
 * For this reason `onAjaxedPages` will only call its callback when a *new* page is loaded.
 *
 * Alternatively, use `onAjaxedPagesRaw` if your callback needs to be called at every page
 * change (e.g. to "unmount" a feature / listener) regardless of of *newness* of the page.
 */
async function onAjaxedPagesRaw(callback: () => void): Promise<void> {
	await onDomReady;
	document.addEventListener('pjax:end', callback);
	callback();
}

function onAjaxedPages(callback: () => void): void {
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

	const ajaxContainer = select('#js-repo-pjax-container,#js-pjax-container');
	if (ajaxContainer) {
		ajaxContainer.append(<has-rgh/>);
	}
});

let log: typeof console.log;

// Rule assumes we don't want to leave it pending:
// eslint-disable-next-line no-async-promise-executor
const globalReady: Promise<Options> = new Promise(async resolve => {
	await elementReady('body');

	if (pageDetect.is500()) {
		return;
	}

	if (document.body.classList.contains('logged-out')) {
		console.warn('%cRefined GitHub%c only works when you’re logged in to GitHub.', 'font-weight: bold', '');
		return;
	}

	if (select.exists('html.refined-github')) {
		console.warn('Refined GitHub has been loaded twice. If you didn’t install the developer version, this may be a bug. Please report it to: https://github.com/sindresorhus/refined-github/issues/565');
		return;
	}

	document.documentElement.classList.add('refined-github');

	// Options defaults
	const options = (await optionsStorage.getAll()) as Options;

	if (options.customCSS.trim().length > 0) {
		document.head.append(<style>{options.customCSS}</style>);
	}

	// Create logging function
	log = options.logging ? console.log : () => { };

	resolve(options);
});

window.collectFeatures = new Map();

const run = async ({id, include, exclude, init, deinit}: FeatureDetails): Promise<void> => {
	// If every `include` is false and no exclude is true, don’t run the feature
	if (include!.every(c => !c()) || exclude!.some(c => c())) {
		return deinit!();
	}

	try {
		// Features can return `false` if they declare themselves as not enabled
		if (await init() !== false) {
			log('✅', id);
		}
	} catch (error) {
		console.log('❌', id);
		console.error(error);
	}
};

const shortcutMap = new Map<string, Shortcut>();
const getShortcuts = (): Shortcut[] => [...shortcutMap.values()];

/*
 * Register a new feature
 */
const add = async (definition: FeatureDetails): Promise<void> => {
	window.collectFeatures.set(definition.id, definition);

	// In chrome:// pages, just collect the features in `window.collectFeatures`
	if (!location.protocol.startsWith('http')) {
		return;
	}

	/* Input defaults and validation */
	const {
		id,
		description,
		include = [() => true], // Default: every page
		exclude = [], // Default: nothing
		load = (fn: VoidFunction) => fn(), // Run it right away
		init,
		deinit = () => {}, // Noop
		shortcuts = {},
		disabled = false
	} = definition;

	/* Feature filtering and running */
	const options = await globalReady;
	if (disabled || options[`feature:${id}`] === false) {
		log('↩️', 'Skipping', id, disabled ? `because of ${disabled}` : '');
		return;
	}

	// 404 pages should only run 404-only features
	if (pageDetect.is404() && !include.includes(pageDetect.is404)) {
		return;
	}

	// Register feature shortcuts
	for (const hotkey of Object.keys(shortcuts)) {
		const description = shortcuts[hotkey];
		shortcutMap.set(hotkey, {hotkey, description});
	}

	// Initialize the feature using the specified loading mechanism
	const details: FeatureDetails = {id, description, include, exclude, init, deinit};
	if (load === onNewComments) {
		details.init = async () => {
			const result = await init();
			onNewComments(init);
			return result;
		};

		onAjaxedPages(() => run(details));
	} else if (load instanceof Promise) {
		await load;
		run(details);
	} else {
		load(() => run(details));
	}
};

export default {
	// Module methods
	add,
	getShortcuts,

	// Loading mechanisms
	onDomReady,
	onNewComments,
	onFileListUpdate,
	onAjaxedPages,
	onAjaxedPagesRaw,

	// Loading filters
	...pageDetect
};
