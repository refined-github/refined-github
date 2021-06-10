import './hide-empty-split-diff-side.css';
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
				diffTable.classList.add('rgh-empty-split-' + side);
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
