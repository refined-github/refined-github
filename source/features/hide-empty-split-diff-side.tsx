import './hide-empty-split-diff-side.css';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

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
		pageDetect.isPRFiles
	],
	exclude: [
		() => !select.exists('[value="split"][checked]')
	],
	init
});
