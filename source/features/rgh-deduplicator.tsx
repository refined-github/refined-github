import React from 'dom-chef';
import {$optional} from 'select-dom/strict.js';

import {_} from '../helpers/hotfix.js';
import features from '../feature-manager.js';

/*
When navigating back and forth in history, GitHub will preserve the DOM changes;
This means that the old features will still be on the page and don't need to re-run.

This marks each as "processed"
*/
void features.add('rgh-deduplicator' as FeatureID, {
	awaitDomReady: true,
	async init() {
		// `await` kicks it to the next tick, after the other features have checked for 'has-rgh', so they can run once.
		await Promise.resolve();
		$optional('has-rgh')?.remove(); // https://github.com/refined-github/refined-github/issues/6568
		$optional(_`#js-repo-pjax-container, #js-pjax-container`)?.append(<has-rgh />);
		$optional(_`turbo-frame`)?.append(<has-rgh-inner />); // #4567
	},
});

/* Test URLs: all */
