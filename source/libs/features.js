import {h} from 'dom-chef';
import select from 'select-dom';
import domReady from 'dom-loaded';
import isPromise from 'p-is-promise';
import OptionsSync from 'webext-options-sync';
import onNewComments from './on-new-comments';
import * as pageDetect from './page-detect';
import {safeElementReady} from './utils';

/*
 * When navigating back and forth in history, GitHub will preserve the DOM changes;
 * This means that the old features will still be on the page and don't need to re-run.
 * For this reason `onAjaxedPages` will only call its callback when a *new* page is loaded.
 *
 * Alternatively, use `onAjaxedPagesRaw` if your callback needs to be called at every page
 * change (e.g. to "unmount" a feature / listener) regardless of of *newness* of the page.
 */
async function onAjaxedPagesRaw(callback) {
	await domReady;
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
const globalReady = new Promise(async resolve => {
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
	const options = Object.assign(
		{
			disabledFeatures: '',
			customCSS: '',
			logging: false
		},
		await new OptionsSync().getAll()
	);

	if (options.customCSS.trim().length > 0) {
		document.head.append(<style>{options.customCSS}</style>);
	}

	// Create logging function
	options.log = options.logging ? console.log : () => {};

	resolve(options);
});

const run = async ({filename, include, exclude, init, deinit, options: {log}}) => {
	if (include.every(c => !c()) || exclude.some(c => c())) {
		await deinit();
		return;
	}

	try {
		// Features can return `false` if they declare themselves as not enabled
		if (await init() !== false) {
			log('✅', filename);
		}
	} catch (error) {
		console.error(error);
	}
};

/**
 * Register a new feature
 *
 * @param {object} definition Information about the feature
 * @param {string} definition.id  Must match the filename
 * @param {booleanFunction[]} [definition.include]  Init is called if any of these is true
 * @param {booleanFunction[]} [definition.exclude]  Init is not called if any of these is true
 * @param {(callerFunction|Promise)} definition.load     Loading mechanism for the feature
 * @param {featureFunction}          definition.init     Function that runs the feature
 * @param {function}                 [definition.deinit] Function that's called none of the conditions match
 */
const add = async definition => {
	const options = await globalReady;

	const {
		id: filename,
		include = [() => true], // Default: On all pages
		exclude = [], // Default: On all pages
		load = fn => fn(), // Run it right away
		init,
		deinit = () => {}, // Noop
		...invalidProps
	} = definition;

	if (options.disabledFeatures.includes(filename)) {
		options.log('↩️', 'Skipping', filename);
		return;
	}

	if (Object.keys(invalidProps).length > 0) {
		throw new Error(`The function "${filename}" was initialized with invalid props: ${Object.keys(invalidProps).join(', ')}`);
	}

	if ([...include, ...exclude].some(d => typeof d !== 'function')) {
		throw new TypeError('include/exclude must be boolean-returning functions');
	}

	// 404 pages should only run 404-only features
	if (pageDetect.is404() && !include.includes(pageDetect.is404)) {
		return;
	}

	// Initialize the feature using the specified loading mechanism
	const details = {filename, include, exclude, init, deinit, options};
	if (load === onNewComments) {
		details.init = async () => {
			await init();
			onNewComments(init);
		};
		onAjaxedPages(() => run(details));
	} else if (isPromise(load)) {
		await load;
		run(details);
	} else {
		load(() => run(details));
	}
};

export default {
	...pageDetect,
	add,
	domReady,
	onNewComments,
	onAjaxedPages,
	onAjaxedPagesRaw
};

/**
 * Local JSDoc function definitions
 *
 * @callback booleanFunction
 * @returns {boolean}
 *
 * @callback callerFunction
 * @param {function} callback Function to be called
 *
 * @callback featureFunction
 * @param {function} init Function that runs the feature
 * @returns {(boolean|undefined)}
 */
