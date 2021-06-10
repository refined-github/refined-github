import './no-useless-split-diff-view.css';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function isUnifiedDiff(): boolean {
	return select.exists([
		'[value="unified"][checked]', // Form in PR
		'.table-of-contents .selected[href*="diff=unified"]' // Link in single commit
	]);
}

function init(): void {
	for (const diffTable of select.all('.js-diff-table')) {
		for (const side of ['left', 'right']) {
			if (!select.exists(`[data-split-side="${side}"]:is(.blob-code-addition, .blob-code-deletion)`, diffTable)) {
				diffTable.dataset.rghNoUselessSplitDiffView = side;
				break;
			}
		}
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isCommit,
		pageDetect.isCompare,
		pageDetect.isPRFiles
	],
	exclude: [
		isUnifiedDiff
	],
	init
});
