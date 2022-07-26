import './no-unnecessary-split-diff-view.css';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {onDiffFileLoad} from '../github-events/on-fragment-load';

function isUnifiedDiff(): boolean {
	return select.exists([
		'[value="unified"][checked]', // Form in PR
		'.table-of-contents .selected[href*="diff=unified"]', // Link in single commit
	]);
}

function init(): void {
	for (const diffTable of select.all('.js-diff-table:not(.rgh-no-unnecessary-split-diff-view-visited)')) {
		diffTable.classList.add('rgh-no-unnecessary-split-diff-view-visited');
		for (const side of ['left', 'right']) {
			if (!select.exists(`[data-split-side="${side}"]:is(.blob-code-addition, .blob-code-deletion)`, diffTable)) {
				diffTable.setAttribute('data-rgh-hide-empty-split-diff-side', side);
				break;
			}
		}
	}
}

void features.add(import.meta.url, {
	asLongAs: [
		// Make sure the class names we need exist on the page #4483
		() => select.exists('.js-diff-table :is([data-split-side="left"], [data-split-side="right"]):is(.blob-code-addition, .blob-code-deletion)'),
	],
	include: [
		pageDetect.hasFiles,
	],
	exclude: [
		isUnifiedDiff,
	],
	additionalListeners: [
		onDiffFileLoad,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
