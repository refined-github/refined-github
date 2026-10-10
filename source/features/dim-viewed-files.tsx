import './dim-viewed-files.css';

import debounce from 'debounce-fn';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import {$$optional, closestElement, elementExists} from 'select-dom';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

const viewedToggleSelector = 'button[class*="MarkAsViewedButton"]';
const treeLinkSelector = 'ul[aria-label="File Tree"] a[href*="#"]';
const dimmedClass = 'rgh-dim-viewed-files';

const updateTree = debounce((): void => {
	for (const link of $$optional(treeLinkSelector)) {
		const row = closestElement('[role="treeitem"]', link);
		const viewed = elementExists(
			`#${CSS.escape(link.hash.slice(1))} ${viewedToggleSelector}[aria-pressed="true"]`,
		);
		row.classList.toggle(dimmedClass, viewed);
	}
}, {wait: 100});

export function init(signal: AbortSignal): void {
	observe(
		[
			treeLinkSelector,
			// The pressed selector also catches viewed state loaded after the button renders.
			`${viewedToggleSelector}[aria-pressed="true"]`,
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
