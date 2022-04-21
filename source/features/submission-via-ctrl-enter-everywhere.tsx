import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function addQuickSubmit(): void {
	select('input#commit-summary-input')!.classList.add('js-quick-submit');
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isNewFile,
		pageDetect.isEditingFile,
	],
	init: addQuickSubmit,
});
