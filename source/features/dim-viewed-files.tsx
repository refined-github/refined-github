import './dim-viewed-files.css';

import {onAbort} from 'abort-utils';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import {$$optional, $optional, elementExists} from 'select-dom';

import features from '../feature-manager.js';
import {frame} from '../helpers/dom-utils.js';
import observe from '../helpers/selector-observer.js';
import {viewedToggleSelector} from '../helpers/viewed-file-selectors.js';

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
const treeFolderSelector = [
	'[role="treeitem"][aria-expanded]',
	// Old view
	'li[data-tree-entry-type="directory"]',
] as const;
const dimmedClass = 'rgh-dim-viewed-files';

// Dim only the folder's own row, not its nested subtree, to avoid compounding opacity
function getFolderRow(folder: HTMLElement): HTMLElement {
	for (const child of folder.children) {
		if (child instanceof HTMLElement && !child.matches('ul, [role="group"]')) {
			return child;
		}
	}

	return folder;
}

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

	const treeLinks = $$optional(treeLinkSelectors);
	for (const link of treeLinks) {
		const row = link.closest(treeFileSelector) ?? link;
		row.classList.toggle(dimmedClass, viewedAnchors.get(link.hash) === true);
	}

	for (const folder of $$optional(treeFolderSelector)) {
		const descendantFiles = treeLinks.filter(link => folder.contains(link));
		const viewed = descendantFiles.length > 0
			&& descendantFiles.every(link => viewedAnchors.get(link.hash) === true);
		getFolderRow(folder).classList.toggle(dimmedClass, viewed);
	}
}

async function updateAfterRender(signal: AbortSignal): Promise<void> {
	await frame();
	if (!signal.aborted) {
		updateTree();
	}
}

export function init(signal: AbortSignal): void {
	function handleToggle(): void {
		void updateAfterRender(signal);
	}

	observe(
		[
			...treeLinkSelectors,
			...treeFolderSelector,
			'[class^="Diff-module__diffTargetable"]',
			'.js-file',
		],
		updateTree,
		{signal},
	);
	delegate(viewedToggleSelector, 'click', handleToggle, {signal});
	delegate(viewedToggleSelector, 'change', handleToggle, {signal});
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
