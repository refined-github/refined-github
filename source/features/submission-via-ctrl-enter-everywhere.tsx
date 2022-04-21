import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import {isMac} from '../github-helpers';
import features from '.';

function addQuickSubmit(): void {
	select('input#commit-summary-input')!.classList.add('js-quick-submit');
}

void features.add(import.meta.url, {
	shortcuts: {
		[isMac ? 'cmd enter' : 'ctrl enter']: 'Publish a new/edited file',
	},
	include: [
		pageDetect.isNewFile,
		pageDetect.isEditingFile,
	],
	init: addQuickSubmit,
});
