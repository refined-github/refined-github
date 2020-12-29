import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): false | void {
	const originalPreviousNext = $('.commit .BtnGroup.float-right');
	if (!originalPreviousNext) {
		return false;
	}

	const previousNext = originalPreviousNext.cloneNode(true);
	const files = $('#files')!;

	files.after(previousNext);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isPRFiles,
		pageDetect.isPRCommit
	],
	init
});
