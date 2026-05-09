import React from 'dom-chef';
import {$optional} from 'select-dom';

import features from '../feature-manager.js';
import {_} from '../helpers/hotfix.js';

/*
When navigating back and forth in history, GitHub will preserve the DOM changes;
This means that the old features will still be on the page and don't need to re-run.

This marks each as "processed"
*/
void features.add('rgh-deduplicator', {
	awaitDomReady: true,
	async init() {
		// `await` kicks it to the next tick, after the other features have checked for 'has-rgh', so they can run once.
		await Promise.resolve();

		// https://github.com/refined-github/refined-github/issues/6568
		$optional('has-rgh')?.remove();

		// These containers only appear on some pages
		$optional(_`#js-repo-pjax-container, #js-pjax-container`)?.append(<has-rgh />);

		// https://github.com/refined-github/refined-github/issues/4567
		$optional(_`turbo-frame`)?.append(<has-rgh-inner />);
	},
});

/* Test URLs: all */
