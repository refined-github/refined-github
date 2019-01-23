import {React} from 'dom-chef/react';
import select from 'select-dom';
import onDomReady from 'dom-loaded';
import OptionsSync from 'webext-options-sync';
import onNewComments from './on-new-comments';
import * as pageDetect from './page-detect';
import {safeElementReady} from './dom-utils';

type BooleanFunction = () => boolean;
type VoidFunction = () => void;
type callerFunction = (callback: VoidFunction) => void;
type featureFunction = () => boolean | void;
type featurePromisedFunction = () => Promise<boolean | void>;

interface featureShortcuts {
	[key: string]: string
}

interface Shortcut {
	hotkey: string,
	description: string,
}

interface GlobalOptions {
	disabledFeatures: string,
	customCSS: string,
	logging: boolean,
	log?: (...args: any[]) => void
}

interface FeatureDetails {
	id: string,
	include?: BooleanFunction[],
	exclude?: BooleanFunction[],
	init: featureFunction | featurePromisedFunction,
	deinit?: Function,
	load?: callerFunction | Promise<void>,
	shortcuts?: featureShortcuts,
}

interface PrivateFeatureDetails extends FeatureDetails {
	options: GlobalOptions
}

/*
 * When navigating back and forth in history, GitHub will preserve the DOM changes;
 * This means that the old features will still be on the page and don't need to re-run.
 * For this reason `onAjaxedPages` will only call its callback when a *new* page is loaded.
 *
 * Alternatively, use `onAjaxedPagesRaw` if your callback needs to be called at every page
 * change (e.g. to "unmount" a feature / listener) regardless of of *newness* of the page.
 */
async function onAjaxedPagesRaw(callback) {
	await onDomReady;
	document.addEventListener('pjax:end', callback);
	callback();
}

function onAjaxedPages(callback) {
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

// Rule assumes we don't want to leave it pending:
// eslint-disable-next-line no-async-promise-executor
const globalReady: Promise<GlobalOptions> = new Promise(async resolve => {
	await safeElementReady('body');

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
	const options: GlobalOptions = {
		disabledFeatures: '',
		customCSS: '',
		logging: false,
		...await new OptionsSync().getAll()
	};

	if (options.customCSS.trim().length > 0) {
		document.head.append(<style>{options.customCSS}</style>);
	}

	// Create logging function
	options.log = options.logging ? console.log : () => {};

	resolve(options);
});

const run = async ({id, include, exclude, init, deinit, options: {log}}: PrivateFeatureDetails) => {
	// If every `include` is false and no exclude is true, don’t run the feature
	if (include.every(c => !c()) || exclude.some(c => c())) {
		return deinit();
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

const shortcutMap : Map<string, Shortcut> = new Map<string, Shortcut>();
const getShortcuts : () => Array<Shortcut> = () => [...shortcutMap.values()];

/*
 * Register a new feature
 */
const add = async (definition: FeatureDetails) => {
	/* Input defaults and validation */
	const {
		id,
		include = [() => true], // Default: every page
		exclude = [], // Default: nothing
		load = fn => fn(), // Run it right away
		init,
		deinit = () => {}, // Noop
		shortcuts = {},
		...invalidProps
	} = definition;

	if (Object.keys(invalidProps).length > 0) {
		throw new Error(`${id} was added with invalid props: ${Object.keys(invalidProps).join(', ')}`);
	}

	if ([...include, ...exclude].some(d => typeof d !== 'function')) {
		throw new TypeError(`${id}: include/exclude must be boolean-returning functions`);
	}

	/* Feature filtering and running */
	const options = await globalReady;
	if (options.disabledFeatures.includes(id)) {
		options.log('↩️', 'Skipping', id);
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
	const details: PrivateFeatureDetails = {id, include, exclude, init, deinit, options};
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
	onAjaxedPages,
	onAjaxedPagesRaw,

	// Loading filters
	...pageDetect
};
