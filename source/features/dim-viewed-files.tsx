import './dim-viewed-files.css';

import debounce from 'debounce-fn';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import {$$optional, closestElement, elementExists} from 'select-dom';

import features from '../feature-manager.js';
import {is} from '../helpers/css-selectors.js';
import observe from '../helpers/selector-observer.js';
import {viewedToggleSelector} from './batch-mark-files-as-viewed.js';

const treeLinkSelector = 'ul[aria-label="File Tree"] a[href*="#"]';
const dimmedClass = 'rgh-dim-viewed-files';

const updateTree = debounce((): void => {
	for (const link of $$optional(treeLinkSelector)) {
		const row = closestElement('[role="treeitem"]', link);
		const viewed = elementExists(link.hash + ` [aria-pressed="true"]` + is(viewedToggleSelector));
		row.classList.toggle(dimmedClass, viewed);
	}
}, {wait: 100});

export function init(signal: AbortSignal): void {
	observe(
		[
			treeLinkSelector,
			// The pressed selector also catches viewed state loaded after the button renders.
			`[aria-pressed="true"]` + is(viewedToggleSelector),
		],
		updateTree,
		{signal},
	);
	delegate(viewedToggleSelector, 'click', updateTree, {signal});
}

void features.add(import.meta.url, {
	include: [pageDetect.isPRFiles],
	exclude: [pageDetect.isPRFile404, pageDetect.isPRCommit],
	init,
});

/*

Test URLs

https://github.com/refined-github/sandbox/pull/55/files

*/
