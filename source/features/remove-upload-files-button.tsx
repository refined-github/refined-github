import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {getRepoURL} from '../github-helpers';

function init(): void {
	select(`.file-navigation a[href^="/${getRepoURL()}/upload"]`)?.remove();
}

void features.add({
	id: __filebasename,
	description: 'Remove the "Upload files" button',
	screenshot: false
}, {
	include: [
		pageDetect.isRepoTree
	],
	repeatOnAjax: false,
	init
});
