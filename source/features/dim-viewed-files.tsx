import './dim-viewed-files.css';

import debounce from 'debounce-fn';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import {$$optional, $optional, closestElementOptional, elementExists} from 'select-dom';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

// Same as `batch-mark-files-as-viewed`; not imported to avoid pulling in its JSX dependencies
const viewedToggleSelector = [
	'button[class*="MarkAsViewedButton"]',
] as const;

const fileSelector = '[class^="Diff-module__diffTargetable"], .js-file';
const treeLinkSelectors = [
	'li[class*="file-tree-row"] a[href*="#"]',
	'ul[aria-label="File Tree"] a[href*="#"]',
] as const;
const treeFileSelector = [
	'li[class*="file-tree-row"]',
	'li[data-tree-entry-type="file"]',
	'[role="treeitem"]:not([aria-expanded])',
] as const;
const dimmedClass = 'rgh-dim-viewed-files';

const updateTree = debounce((): void => {
	const viewedAnchors = new Map<string, boolean>();
	for (const file of $$optional(fileSelector)) {
		const toggle = $optional(viewedToggleSelector, file);
		const viewed = file.hasAttribute('data-file-user-viewed')
			|| Boolean(
				toggle && (toggle.getAttribute('aria-pressed') === 'true' || elementExists('.octicon-checkbox-fill', toggle)),
			);

		if (file.id) {
			viewedAnchors.set('#' + file.id, viewed);
		}

		const link = $optional([
			'div[class*="file-path-section"] a',
			'.file-info a.Link--primary',
		], file);
		// Missing when the diff is collapsed or its header has not rendered yet
		if (link?.hash) {
			viewedAnchors.set(link.hash, viewed);
		}
	}

	for (const link of $$optional(treeLinkSelectors)) {
		const row = closestElementOptional(treeFileSelector, link) ?? link;
		row.classList.toggle(dimmedClass, viewedAnchors.get(link.hash) === true);
	}
}, {wait: 100});

export function init(signal: AbortSignal): void {
	function handleChange(): void {
		updateTree();
	}

	observe(
		[
			...treeLinkSelectors,
			'[class^="Diff-module__diffTargetable"]',
			'.js-file',
			// GitHub loads the viewed state after rendering the button, without adding a new file
			'button[class*="MarkAsViewedButton"][aria-pressed="true"]',
			'button[class*="MarkAsViewedButton"] .octicon-checkbox-fill',
		],
		handleChange,
		{signal},
	);
	delegate(viewedToggleSelector, 'click', handleChange, {signal});
	delegate(viewedToggleSelector, 'change', handleChange, {signal});
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
