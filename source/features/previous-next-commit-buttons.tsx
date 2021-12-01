import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): false | void {
	const originalPreviousNext = select('.commit .BtnGroup.float-right');
	if (!originalPreviousNext) {
		return false;
	}

	const previousNext = originalPreviousNext.cloneNode(true);
	const condensedVersionWarningBox = select('#files ~ .flash-warn');
	if (condensedVersionWarningBox) {
		previousNext.classList.add('mt-3');
		condensedVersionWarningBox.after(previousNext); // #4503
	} else {
		select('#files')!.after(previousNext);
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRFiles,
		pageDetect.isPRCommit,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
