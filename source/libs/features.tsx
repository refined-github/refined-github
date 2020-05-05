import React from 'dom-chef';
import select from 'select-dom';
import domLoaded from 'dom-loaded';
import {Promisable} from 'type-fest';
import elementReady from 'element-ready';
import {logError} from './utils';
import onNewComments from './on-new-comments';
import onNewsfeedLoad from './on-newsfeed-load';
import * as pageDetect  from 'github-page-detection';
import optionsStorage, {RGHOptions} from '../options-storage';

type BooleanFunction = () => boolean;
type CallerFunction = (callback: VoidFunction) => void;
type FeatureInit = () => Promisable<false | void>;

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
	id: FeatureID;
	description: string;
	screenshot: string | false;
	shortcuts?: FeatureShortcuts;
}

interface FeatureLoader extends Partial<InternalRunConfig> {
	/** Whether to wait for DOM ready before runnin `init`. `false` makes `init` run right as soon as `body` is found. @default true */
	waitForDomReady?: false;

	/** Whether to re-run `init` on pages loaded via AJAX. @default true */
	repeatOnAjax?: false;

	/** When pressing the back button, the DOM and listeners are still there, so normally `init` isn’t called again. If this is true, it’s called anyway.  @default false */
	repeatOnAjaxEvenOnBackButton?: true;

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

const shortcutMap = new Map<string, Shortcut>();
const getShortcuts = (): Shortcut[] => [...shortcutMap.values()];

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
			repeatOnAjaxEvenOnBackButton = false,
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
			domLoaded.then(() => setupPageLoad(id, details));
		} else {
			setupPageLoad(id, details);
		}

		if (repeatOnAjax) {
			document.addEventListener('pjax:end', () => {
				if (repeatOnAjaxEvenOnBackButton || !select.exists('has-rgh')) {
					setupPageLoad(id, details);
				}
			});
		}
	}
};

/*
When navigating back and forth in history, GitHub will preserve the DOM changes;
This means that the old features will still be on the page and don't need to re-run.

This marks each as "processed"
*/
add(undefined, {
	init: async () => {
		// `await` kicks it to the next tick, after the other features have checked for 'has-rgh', so they can run once.
		await Promise.resolve();
		select('#js-repo-pjax-container, #js-pjax-container')?.append(<has-rgh/>);
	}
});

export default {
	add,
	getShortcuts
};
