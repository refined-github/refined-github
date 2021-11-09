import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): false | void {
	const originalPreviousNext = select('.commit .BtnGroup.float-right');
	if (!originalPreviousNext) {
		return false;
	}

	const previousNext = originalPreviousNext.cloneNode(true);
	const files = select('#files')!;

	files.after(previousNext);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRFiles,
		pageDetect.isPRCommit,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
