import './no-useless-split-diff-view.css';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import onDiffFileLoad from '../github-events/on-diff-file-load';

function isUnifiedDiff(): boolean {
	return select.exists([
		'[value="unified"][checked]', // Form in PR
		'.table-of-contents .selected[href*="diff=unified"]', // Link in single commit
	]);
}

function init(): void {
	for (const diffTable of select.all('.js-diff-table:not(.rgh-no-useless-split-diff-view-visited)')) {
		diffTable.classList.add('rgh-no-useless-split-diff-view-visited');
		for (const side of ['left', 'right']) {
			if (!select.exists(`[data-split-side="${side}"]:is(.blob-code-addition, .blob-code-deletion)`, diffTable)) {
				// eslint-disable-next-line unicorn/prefer-dom-node-dataset -- CSS file has the same selector, this can be grepped
				diffTable.setAttribute('data-rgh-hide-empty-split-diff-side', side);
				break;
			}
		}
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isCommit,
		pageDetect.isCompare,
		pageDetect.isPRFiles,
	],
	exclude: [
		isUnifiedDiff,
		// Make sure the class names we need exist on the page #4483
		() => !select.exists('.js-diff-table :is([data-split-side="left"], [data-split-side="right"]):is(.blob-code-addition, .blob-code-deletion)'),
	],
	additionalListeners: [
		onDiffFileLoad,
	],
	init,
});
