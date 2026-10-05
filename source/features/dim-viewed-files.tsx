import './dim-viewed-files.css';

import {onAbort} from 'abort-utils';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import {$$, $$optional, $optional, elementExists} from 'select-dom';

import features from '../feature-manager.js';
import {frame} from '../helpers/dom-utils.js';
import observe from '../helpers/selector-observer.js';
import {viewedToggleSelector} from '../helpers/viewed-file-selectors.js';

const fileSelector = '[class^="Diff-module__diffTargetable"], .js-file';
const treeLinkSelectors = [
	'li[class*="file-tree-row"] a[href*="#"]',
	'ul[aria-label="File Tree"] a[href*="#"]',
] as const;
const dimmedClass = 'rgh-dim-viewed-files';

function updateTree(): void {
	const viewedAnchors = new Map<string, boolean>();
	for (const file of $$(fileSelector)) {
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

	for (const link of $$(treeLinkSelectors)) {
		const row = link.closest('li[class*="file-tree-row"]') ?? link;
		const viewed = viewedAnchors.get(link.hash);
		if (viewed !== undefined && row.classList.contains(dimmedClass) !== viewed) {
			row.classList.toggle(dimmedClass, viewed);
		}
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
