import './dim-viewed-files.css';

import {onAbort} from 'abort-utils';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import {$$optional, $optional, elementExists} from 'select-dom';

import features from '../feature-manager.js';
import {frame} from '../helpers/dom-utils.js';
import observe from '../helpers/selector-observer.js';

// Same as `batch-mark-files-as-viewed`; not imported to avoid pulling in its JSX dependencies
const viewedToggleSelector = [
	'button[class*="MarkAsViewedButton"]',
	// Old view
	'input.js-reviewed-checkbox',
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

function updateTree(): void {
	const viewedAnchors = new Map<string, boolean>();
	for (const file of $$optional(fileSelector)) {
		const toggle = $optional(viewedToggleSelector, file);
		const viewed = toggle instanceof HTMLInputElement
			? toggle.checked
			: file.hasAttribute('data-file-user-viewed')
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
		if (link && link.hash) {
			viewedAnchors.set(link.hash, viewed);
		}
	}

	for (const link of $$optional(treeLinkSelectors)) {
		const row = link.closest(treeFileSelector) ?? link;
		row.classList.toggle(dimmedClass, viewedAnchors.get(link.hash) === true);
	}
}

export function init(signal: AbortSignal): void {
	// Batch the many observer/click callbacks during rendering into a single update per frame
	let isUpdateScheduled = false;
	async function scheduleUpdate(): Promise<void> {
		if (isUpdateScheduled) {
			return;
		}

		isUpdateScheduled = true;
		await frame();
		isUpdateScheduled = false;
		if (!signal.aborted) {
			updateTree();
		}
	}

	function handleChange(): void {
		void scheduleUpdate();
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
	updateTree();
	onAbort(signal, () => {
		for (const row of $$optional('.' + dimmedClass)) {
			row.classList.remove(dimmedClass);
		}
	});
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
