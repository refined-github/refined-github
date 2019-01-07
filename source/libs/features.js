import select from 'select-dom';
import domLoaded from 'dom-loaded';
import isPromise from 'p-is-promise';
import OptionsSync from 'webext-options-sync';
import onAjaxedPages from 'github-injection';
import onNewComments from './on-new-comments';
import * as pageDetect from './page-detect';
import {safeElementReady} from './utils';

const options = new OptionsSync().getAll();

/*
 *`github-injection` happens even when the user navigates in history
 * This causes listeners to run on content that has already been updated.
 * If a feature needs to be disabled when navigating away,
 * use the regular `github-injection`
 */
function safeOnAjaxedPages(callback) {
	onAjaxedPages(async () => {
		if (select.exists('has-rgh')) {
			return;
		}
		await domLoaded;

		// Push safeOnAjaxedPages on the next tick so it happens in the correct order
		// (specifically for addOpenAllNotificationsButton)
		await Promise.resolve();
		callback();
	});
}

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

	const {customCSS = ''} = await options;
	if (customCSS.length > 0) {
		document.head.append(<style>{customCSS}</style>);
	}

	resolve();
});

const run = async (filename, constraints, fn) => {
	if (!constraints.every(c => c())) {
		return;
	}
	const {disabledFeatures = '', logging = false} = await options;
	const log = logging ? console.log : () => {};

	if (disabledFeatures.includes(filename)) {
		log('↩️', 'Skipping', filename);
		return;
	}
	try {
		// Features can return `false` if they declare themselves as not enabled
		if (await fn() !== false) {
			log('✅', filename);
		}
	} catch (error) {
		console.log('❌', filename);
		console.error(error);
	}
};
/**
 * @callback booleanFunction
 * @returns {boolean}
 */
/**
 * @callback callerFunction
 * @param {function} callback Function to be called
 */
/**
 * @callback featureFunction
 * @param {function} init Function that runs the feature
 * @returns {(boolean|undefined)}
 *
 */
/**
 * Register a new feature
 *
 * @param {object} definition Information about the feature
 * @param {string} definition.id  Must match the filename
 * @param {booleanFunction[]} [definition.dependencies] Init is called if any of these is true
 * @param {(callerFunction|Promise)} definition.load    Loading mechanism for the feature
 * @param {featureFunction}          definition.init    Function that runs the feature
 */
const add = async definition => {
	await globalReady;

	const {
		id: filename,
		dependencies = [], // Default: On all pages
		load = fn => fn(), // Run it right away
		init
	} = definition;

	if (dependencies.some(d => typeof d !== 'function')) {
		throw new TypeError('Dependencies must be boolean-returning functions');
	}

	// 404 pages should only run 404-only features
	if (pageDetect.is404() && !dependencies.includes(pageDetect.is404)) {
		return;
	}

	// Initialize the feature using the specified loading mechanism
	if (load === onNewComments) {
		safeOnAjaxedPages(async () => {
			run(filename, dependencies, async () => {
				await init();
				onNewComments(init);
			});
		});
	} else if (isPromise(load)) {
		await load;
		run(filename, dependencies, init);
	} else {
		load(() => run(filename, dependencies, init));
	}
};

const not = fn => () => !fn();
const and = (...fns) => () => fns.every(fn => fn());

export default {
	...pageDetect,
	add,
	not,
	and,
	domLoaded,
	onAjaxedPages,
	safeOnAjaxedPages,
	onNewComments,
	safeElementReady
};
