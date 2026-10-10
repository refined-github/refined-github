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
	const viewedAnchors = new Set<string>();
	for (const file of $$optional('[class^="Diff-module__diffTargetable"]')) {
		if (elementExists(viewedToggleSelector + '[aria-pressed="true"]', file)) {
			viewedAnchors.add('#' + file.id);
		}
	}

	for (const link of $$optional(treeLinkSelector)) {
		const row = closestElement('[role="treeitem"]', link);
		row.classList.toggle(dimmedClass, viewedAnchors.has(link.hash));
	}
}, {wait: 100});

export function init(signal: AbortSignal): void {
	function handleChange(): void {
		updateTree();
	}

	observe(
		// The pressed selector also catches viewed state loaded after the button renders.
		`${treeLinkSelector}, ${viewedToggleSelector}, ${viewedToggleSelector}[aria-pressed="true"]`,
		handleChange,
		{signal},
	);
	delegate(viewedToggleSelector, 'click', handleChange, {signal});
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
